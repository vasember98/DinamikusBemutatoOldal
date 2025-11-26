import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '$lib/server/password';
export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw redirect(302, '/login');
	}
	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email ?? '',
			fullName: user.fullName ?? '',
			avatarUrl: user.avatarUrl ?? ''
		}
	};
};
export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, {
				success: false,
				message: 'Nem vagy bejelentkezve.',
				action: 'updateProfile'
			});
		}
		const data = await request.formData();
		const fullName = String(data.get('fullName') ?? '').trim();
		const avatarUrl = String(data.get('avatarUrl') ?? '').trim();
		try {
			await db
				.update(table.user)
				.set({ fullName, avatarUrl })
				.where(eq(table.user.id, user.id));
			return {
				success: true,
				message: 'Profil frissítve.',
				action: 'updateProfile',
				fullName,
				avatarUrl
			};
		} catch (err) {
			console.error(err);
			return fail(500, {
				success: false,
				message: 'Nem sikerült frissíteni a profilt.',
				action: 'updateProfile'
			});
		}
	},
	changePassword: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, {
				success: false,
				message: 'Nem vagy bejelentkezve.',
				action: 'changePassword'
			});
		}
		const data = await request.formData();
		const currentPassword = String(data.get('current_password') ?? '');
		const newPassword = String(data.get('new_password') ?? '');
		const confirm = String(data.get('confirm_password') ?? '');
		if (!currentPassword || !newPassword || !confirm) {
			return fail(400, {
				success: false,
				message: 'Tölts ki minden mezőt.',
				action: 'changePassword'
			});
		}
		if (newPassword !== confirm) {
			return fail(400, {
				success: false,
				message: 'Az új jelszavak nem egyeznek.',
				action: 'changePassword'
			});
		}
		if (newPassword.length < 8) {
			return fail(400, {
				success: false,
				message: 'Az új jelszónak legalább 8 karakter hosszúnak kell lennie.',
				action: 'changePassword'
			});
		}
		try {
			const [dbUser] = await db
				.select({ passwordHash: table.user.passwordHash })
				.from(table.user)
				.where(eq(table.user.id, user.id));
			if (!dbUser) {
				return fail(400, {
					success: false,
					message: 'Felhasználó nem található.',
					action: 'changePassword'
				});
			}
			const validCurrent = await verifyPassword(currentPassword, dbUser.passwordHash);
			if (!validCurrent) {
				return fail(400, {
					success: false,
					message: 'A jelenlegi jelszó hibás.',
					action: 'changePassword'
				});
			}
			const newHash = await hashPassword(newPassword);
			await db
				.update(table.user)
				.set({ passwordHash: newHash })
				.where(eq(table.user.id, user.id));
			return {
				success: true,
				message: 'Jelszó frissítve.',
				action: 'changePassword'
			};
		} catch (err) {
			console.error(err);
			return fail(500, {
				success: false,
				message: 'Nem sikerült frissíteni a jelszót.',
				action: 'changePassword'
			});
		}
	}
};
