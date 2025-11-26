import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/password';

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const SESSION_EXPIRY_DAYS = 30;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const randomBytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(randomBytes);
}

export async function createSession(token: string, userId: string) {
	const encoder = new TextEncoder();
	const tokenBytes = encoder.encode(token);
	const hashedToken = sha256(tokenBytes);
	const sessionId = encodeHexLowerCase(hashedToken);
	
	const expirationDate = new Date(Date.now() + DAY_IN_MS * SESSION_EXPIRY_DAYS);
	
	const newSession: table.Session = {
		id: sessionId,
		userId: userId,
		expiresAt: expirationDate
	};
	
	await db.insert(table.session).values(newSession);
	
	return newSession;
}
export async function validateSessionToken(token: string) {
	const hashedToken = sha256(new TextEncoder().encode(token));
	const sessionId = encodeHexLowerCase(hashedToken);
	
	const results = await db
		.select({
			user: {
				id: table.user.id,
				username: table.user.username,
				email: table.user.email,
				fullName: table.user.fullName,
				avatarUrl: table.user.avatarUrl
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));
	
	if (!results || results.length === 0) {
		return { session: null, user: null };
	}
	
	const result = results[0];
	const { session, user } = result;
	
	const now = Date.now();
	const expiryTime = session.expiresAt.getTime();
	const isExpired = now >= expiryTime;
	
	if (isExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null };
	}
	
	const renewalThreshold = DAY_IN_MS * 15;
	const timeUntilExpiry = expiryTime - now;
	const shouldRenew = timeUntilExpiry <= renewalThreshold;
	
	if (shouldRenew) {
		const newExpiryDate = new Date(now + DAY_IN_MS * SESSION_EXPIRY_DAYS);
		session.expiresAt = newExpiryDate;
		
		await db
			.update(table.session)
			.set({ expiresAt: newExpiryDate })
			.where(eq(table.session.id, session.id));
	}
	
	return { session, user };
}
export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(
	event: Pick<RequestEvent, 'cookies'>,
	token: string,
	expiresAt: Date
) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: Pick<RequestEvent, 'cookies'>) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

export async function verifyUser(username: string, password: string) {
	const users = await db
		.select()
		.from(table.user)
		.where(eq(table.user.username, username));
	
	if (!users || users.length === 0) {
		return null;
	}
	
	const user = users[0];
	
	if (!user.passwordHash) {
		return null;
	}
	
	const passwordValid = await verifyPassword(password, user.passwordHash);
	
	if (!passwordValid) {
		return null;
	}
	
	const userData = {
		id: user.id,
		username: user.username,
		email: user.email,
		fullName: user.fullName,
		avatarUrl: user.avatarUrl
	};
	
	return userData;
}
