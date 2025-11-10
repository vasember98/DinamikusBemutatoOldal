// src/routes/account/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		user: locals.user
	};
};

export const actions: Actions = {
	login: async (event) => {
		const { locals, request } = event;

		if (locals.user) {
			throw redirect(303, '/account');
		}

		const formData = await request.formData();
		const username = String(formData.get('username') || '').trim();
		const password = String(formData.get('password') || '');

		if (!username || !password) {
			return fail(400, {
				message: 'Kérlek add meg a felhasználónevet és a jelszót.',
				username
			});
		}

		const user = await auth.verifyUser(username, password);
		if (!user) {
			return fail(400, {
				message: 'Hibás felhasználónév vagy jelszó.',
				username
			});
		}

		const token = auth.generateSessionToken();
		const session = await auth.createSession(token, user.id);
		auth.setSessionTokenCookie(event, token, session.expiresAt);

		throw redirect(303, '/account');
	},

	logout: async (event) => {
		const { locals } = event;

		if (locals.session) {
			await auth.invalidateSession(locals.session.id);
		}

		auth.deleteSessionTokenCookie(event);

		throw redirect(303, '/account');
	}
};
