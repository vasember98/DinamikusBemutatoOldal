import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	generateSessionToken,
	createSession,
	validateSessionToken,
	invalidateSession,
	setSessionTokenCookie,
	deleteSessionTokenCookie,
	verifyUser
} from '$lib/server/auth';
import { hashPassword } from '$lib/server/password';
export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user ?? null
	};
};
export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		
		const usernameRaw = formData.get('username');
		const passwordRaw = formData.get('password');
		
		const username = String(usernameRaw ?? '').trim();
		const password = String(passwordRaw ?? '');
		
		if (!username || !password) {
			return fail(400, {
				username,
				message: 'Felhasználónév és jelszó megadása kötelező.'
			});
		}
		
		const authenticatedUser = await verifyUser(username, password);
		
		if (!authenticatedUser) {
			return fail(400, {
				username,
				message: 'Hibás felhasználónév vagy jelszó.'
			});
		}
		
		const sessionToken = generateSessionToken();
		const newSession = await createSession(sessionToken, authenticatedUser.id);
		
		setSessionTokenCookie({ cookies }, sessionToken, newSession.expiresAt);
		
		return { success: true };
	},
	
	logout: async ({ locals, cookies }) => {
		const currentSession = locals.session;
		
		if (currentSession) {
			await invalidateSession(currentSession.id);
		}
		
		deleteSessionTokenCookie({ cookies });
		
		return { success: true };
	},
	register: async ({ request, cookies }) => {
		const formData = await request.formData();
		
		const username = String(formData.get('username') ?? '').trim();
		const fullNameInput = String(formData.get('fullName') ?? '').trim();
		const fullName = fullNameInput.length > 0 ? fullNameInput : null;
		const password = String(formData.get('password') ?? '');
		const passwordConfirm = String(formData.get('passwordConfirm') ?? '');
		
		if (!username || !password || !passwordConfirm) {
			return fail(400, {
				username,
				fullName,
				registerMessage: 'Minden kötelező mezőt tölts ki.'
			});
		}
		
		if (password !== passwordConfirm) {
			return fail(400, {
				username,
				fullName,
				registerMessage: 'A jelszavak nem egyeznek.'
			});
		}
		
		const MIN_PASSWORD_LENGTH = 8;
		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(400, {
				username,
				fullName,
				registerMessage: 'A jelszónak legalább 8 karakter hosszúnak kell lennie.'
			});
		}
		
		const existingUsers = await db
			.select({ id: table.user.id })
			.from(table.user)
			.where(eq(table.user.username, username));
		
		if (existingUsers && existingUsers.length > 0) {
			return fail(400, {
				username,
				fullName,
				registerMessage: 'Ezzel a felhasználónévvel már létezik fiók.'
			});
		}
		
		const hashedPassword = await hashPassword(password);
		const newUserId = crypto.randomUUID();
		
		await db.insert(table.user).values({
			id: newUserId,
			username: username,
			fullName: fullName,
			passwordHash: hashedPassword
		});
		
		const sessionToken = generateSessionToken();
		const userSession = await createSession(sessionToken, newUserId);
		
		setSessionTokenCookie({ cookies }, sessionToken, userSession.expiresAt);
		
		return { success: true };
	}
};
