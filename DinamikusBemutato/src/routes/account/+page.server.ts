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
		const data = await request.formData();
		const username = String(data.get('username') ?? '').trim();
		const password = String(data.get('password') ?? '');
		if (!username || !password) {
			return fail(400, {
				username,
				message: 'Felhasználónév és jelszó megadása kötelező.'
			});
		}
		const user = await verifyUser(username, password);
		if (!user) {
			return fail(400, {
				username,
				message: 'Hibás felhasználónév vagy jelszó.'
			});
		}
		const token = generateSessionToken();
		const session = await createSession(token, user.id);
		setSessionTokenCookie({ cookies }, token, session.expiresAt);
		return { success: true };
	},
	logout: async ({ locals, cookies }) => {
		if (locals.session) {
			await invalidateSession(locals.session.id);
		}
		deleteSessionTokenCookie({ cookies });
		return { success: true };
	},
	register: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = String(data.get('username') ?? '').trim();
		const fullNameRaw = String(data.get('fullName') ?? '').trim();
		const fullName = fullNameRaw.length ? fullNameRaw : null;
		const password = String(data.get('password') ?? '');
		const passwordConfirm = String(data.get('passwordConfirm') ?? '');
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
		if (password.length < 8) {
			return fail(400, {
				username,
				fullName,
				registerMessage: 'A jelszónak legalább 8 karakter hosszúnak kell lennie.'
			});
		}
		const [existing] = await db
			.select({ id: table.user.id })
			.from(table.user)
			.where(eq(table.user.username, username));
		if (existing) {
			return fail(400, {
				username,
				fullName,
				registerMessage: 'Ezzel a felhasználónévvel már létezik fiók.'
			});
		}
		const passwordHash = await hashPassword(password);
		const userId = crypto.randomUUID();
		await db.insert(table.user).values({
			id: userId,
			username,
			fullName,
			passwordHash
		});
		const token = generateSessionToken();
		const session = await createSession(token, userId);
		setSessionTokenCookie({ cookies }, token, session.expiresAt);
		return { success: true };
	}
};
