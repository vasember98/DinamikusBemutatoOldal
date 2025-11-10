import { mysqlTable, serial, int, varchar, datetime } from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
	id: varchar('id', { length: 255 }).primaryKey(),

	age: int('age'),

	username: varchar('username', { length: 32 }).notNull().unique(),

	passwordHash: varchar('password_hash', { length: 255 }).notNull(),

	email: varchar('email', { length: 255 }),

	fullName: varchar('full_name', { length: 255 }),

	avatarUrl: varchar('avatar_url', { length: 512 })
});

export const session = mysqlTable('session', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 })
		.notNull()
		.references(() => user.id),
	expiresAt: datetime('expires_at').notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
