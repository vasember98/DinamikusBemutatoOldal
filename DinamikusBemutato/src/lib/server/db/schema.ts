import { mysqlTable, serial, int, varchar, datetime, bigint, timestamp, text, mysqlEnum, json } from 'drizzle-orm/mysql-core';

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


export const tananyag = mysqlTable('tananyag', {
  id: varchar('id', { length: 50 }).primaryKey(), // pl. 'tananyag'
  basePath: varchar('base_path', { length: 255 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const chapters = mysqlTable('chapters', {
  id: varchar('id', { length: 100 }).primaryKey(), // Chapter.id (slug)
  tananyagId: varchar('tananyag_id', { length: 50 })
    .notNull()
    // FK-t Drizzle-relations-ben tudod hozzákötni
  ,
  title: varchar('title', { length: 255 }).notNull(),
  path: varchar('path', { length: 255 }).notNull(),
  summary: text('summary').notNull(),

  prevTargetId: varchar('prev_target_id', { length: 100 }),
  prevLabel: varchar('prev_label', { length: 255 }),
  nextTargetId: varchar('next_target_id', { length: 100 }),
  nextLabel: varchar('next_label', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const chapterSources = mysqlTable('chapter_sources', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  chapterId: varchar('chapter_id', { length: 100 }).notNull(),

  file: varchar('file', { length: 255 }).notNull(),
  fromSlide: int('from_slide').notNull(),
  toSlide: int('to_slide').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull()
});

export type AnswerValue =
  | number
  | string
  | boolean
  | (number | string)[]
  | Record<string, unknown>;

export type MatchPairs = {
  left: string[];
  right: string[];
};

export const quizSets = mysqlTable('quiz_sets', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  version: varchar('version', { length: 50 }).notNull(),
  source: varchar('source', { length: 255 }),
  language: varchar('language', { length: 10 }).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const quizQuestions = mysqlTable('quiz_questions', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),

  quizSetId: bigint('quiz_set_id', { mode: 'number' }).notNull(),
  externalId: varchar('external_id', { length: 50 }).notNull(),

  topic: varchar('topic', { length: 255 }).notNull(),
  type: mysqlEnum('type', [
    'single_choice',
    'multiple_choice',
    'true_false',
    'match_pairs'
  ]).notNull(),

  prompt: text('prompt').notNull(),

  explanation: text('explanation'),
  difficulty: mysqlEnum('difficulty', ['easy', 'medium', 'hard']),

  answer: json('answer').$type<AnswerValue>().notNull(),
  pairs: json('pairs').$type<MatchPairs | null>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

export const quizOptions = mysqlTable('quiz_options', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),

  questionId: bigint('question_id', { mode: 'number' }).notNull(),
  logicalId: varchar('logical_id', { length: 50 }).notNull(),
  text: text('text').notNull(),
  sortOrder: int('sort_order').notNull().default(0)
});