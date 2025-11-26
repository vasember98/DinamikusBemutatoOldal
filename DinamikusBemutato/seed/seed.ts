// seed/seed.ts
import 'dotenv/config';
import { db, schema, pool } from './db-seed';
import { hashPassword } from '../src/lib/server/password';
import anyagBontas from '../src/lib/tananyag/anyagBontas.json';
import questionsJson from '../src/lib/quiz/questions.json';

const {
  tananyag,
  chapters,
  chapterSources,
  quizSets,
  quizQuestions,
  quizOptions,
  user,
  session
} = schema;

/**
 * Táblák teljes resetje: DROP IF EXISTS + CREATE
 * FIGYELEM: minden adat elvész.
 */
async function resetSchema() {
  console.log('--- SCHEMA RESET (drop + create tables) ---');

  // FK-k ideiglenes kikapcsolása
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');

  // Gyerek → szülő sorrendben droppolunk
  await pool.query(`
    DROP TABLE IF EXISTS
      quiz_options,
      quiz_questions,
      quiz_sets,
      chapter_sources,
      chapters,
      tananyag,
      session,
      user;
  `);

  // Táblák újralétrehozása – a Drizzle schema alapján
  // 1) user
  await pool.query(`
    CREATE TABLE user (
      id           varchar(255)  NOT NULL,
      age          int           NULL,
      username     varchar(32)   NOT NULL,
      password_hash varchar(255) NOT NULL,
      email        varchar(255)  NULL,
      full_name    varchar(255)  NULL,
      avatar_url   varchar(512)  NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_user_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2) session
  await pool.query(`
    CREATE TABLE session (
      id         varchar(255) NOT NULL,
      user_id    varchar(255) NOT NULL,
      expires_at datetime     NOT NULL,
      PRIMARY KEY (id),
      KEY idx_session_user_id (user_id),
      CONSTRAINT fk_session_user
        FOREIGN KEY (user_id) REFERENCES user(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3) tananyag
  await pool.query(`
    CREATE TABLE tananyag (
      id         varchar(50)  NOT NULL,
      base_path  varchar(255) NOT NULL,
      created_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4) chapters
  await pool.query(`
    CREATE TABLE chapters (
      id             varchar(100) NOT NULL,
      tananyag_id    varchar(50)  NOT NULL,
      title          varchar(255) NOT NULL,
      path           varchar(255) NOT NULL,
      summary        text         NOT NULL,
      prev_target_id varchar(100) NULL,
      prev_label     varchar(255) NULL,
      next_target_id varchar(100) NULL,
      next_label     varchar(255) NULL,
      created_at     timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_chapters_tananyag_id (tananyag_id),
      CONSTRAINT fk_chapters_tananyag
        FOREIGN KEY (tananyag_id) REFERENCES tananyag(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5) chapter_sources
  await pool.query(`
    CREATE TABLE chapter_sources (
      id         bigint       NOT NULL AUTO_INCREMENT,
      chapter_id varchar(100) NOT NULL,
      file       varchar(255) NOT NULL,
      from_slide int          NOT NULL,
      to_slide   int          NOT NULL,
      created_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_chapter_sources_chapter_id (chapter_id),
      CONSTRAINT fk_chapter_sources_chapter
        FOREIGN KEY (chapter_id) REFERENCES chapters(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6) quiz_sets
  await pool.query(`
    CREATE TABLE quiz_sets (
      id         bigint       NOT NULL AUTO_INCREMENT,
      version    varchar(50)  NOT NULL,
      source     varchar(255) NULL,
      language   varchar(10)  NOT NULL,
      created_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7) quiz_questions
  await pool.query(`
    CREATE TABLE quiz_questions (
      id          bigint       NOT NULL AUTO_INCREMENT,
      quiz_set_id bigint       NOT NULL,
      external_id varchar(50)  NOT NULL,
      topic       varchar(255) NOT NULL,
      type        enum('single_choice', 'multiple_choice', 'true_false', 'match_pairs') NOT NULL,
      prompt      text         NOT NULL,
      explanation text         NULL,
      difficulty  enum('easy', 'medium', 'hard') NULL,
      answer      json         NOT NULL,
      pairs       json         NULL,
      created_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_quiz_questions_quiz_set_id (quiz_set_id),
      CONSTRAINT fk_quiz_questions_quiz_set
        FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 8) quiz_options
  await pool.query(`
    CREATE TABLE quiz_options (
      id          bigint       NOT NULL AUTO_INCREMENT,
      question_id bigint       NOT NULL,
      logical_id  varchar(50)  NOT NULL,
      text        text         NOT NULL,
      sort_order  int          NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      KEY idx_quiz_options_question_id (question_id),
      CONSTRAINT fk_quiz_options_question
        FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // FK-k visszakapcsolása
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('--- SCHEMA RESET kész ---');
}

async function seedUsers() {
  console.log('user/session + demo user');

  await db.delete(session);
  await db.delete(user);

  const demoUserId = 'demo-user-1';
  const hashedPassword = await hashPassword('admin');

  await db.insert(user).values({
    id: demoUserId,
    username: 'admin',
    passwordHash: hashedPassword,
    email: 'demo@example.com',
    fullName: 'Demo admin',
    age: 21,
    avatarUrl: null
  });
}

async function seedTananyagFromJson() {
  console.log('tananyag');

  await db.delete(chapterSources);
  await db.delete(chapters);
  await db.delete(tananyag);

  const t = (anyagBontas as any).tananyag;
  const tananyagId: string = t.id ?? 'tananyag';

  await db.insert(tananyag).values({
    id: tananyagId,
    basePath: t.basePath
  });

  for (const ch of t.chapters as any[]) {
    const prev = ch.prevNext?.prev;
    const next = ch.prevNext?.next;

    await db.insert(chapters).values({
      id: ch.id,
      tananyagId,
      title: ch.title,
      path: ch.path,
      summary: ch.summary,
      prevTargetId: prev?.targetId ?? null,
      prevLabel: prev?.label ?? null,
      nextTargetId: next?.targetId ?? null,
      nextLabel: next?.label ?? null
    });

    if (Array.isArray(ch.sources)) {
      for (const src of ch.sources) {
        await db.insert(chapterSources).values({
          chapterId: ch.id,
          file: src.file,
          fromSlide: src.fromSlide,
          toSlide: src.toSlide
        });
      }
    }
  }
}

async function seedQuizFromJson() {
  console.log('quiz');

  await db.delete(quizOptions);
  await db.delete(quizQuestions);
  await db.delete(quizSets);

  const qRoot = questionsJson as any;

  const quizSetId = 1;

  await db.insert(quizSets).values({
    id: quizSetId,
    version: qRoot.version,
    source: qRoot.source,
    language: qRoot.language
  });

  let questionIdCounter = 1;
  let optionIdCounter = 1;

  for (const q of qRoot.questions as any[]) {
    const thisQuestionId = questionIdCounter++;

    await db.insert(quizQuestions).values({
      id: thisQuestionId,
      quizSetId,
      externalId: q.id,
      topic: q.topic,
      type: q.type,
      prompt: q.prompt,
      explanation: q.explanation ?? null,
      difficulty: q.difficulty ?? null,
      answer: q.answer,
      pairs: q.pairs ?? null
    });

    if (Array.isArray(q.options)) {
      let sort = 1;
      for (const opt of q.options) {
        await db.insert(quizOptions).values({
          id: optionIdCounter++,
          questionId: thisQuestionId,
          logicalId: opt.logicalId ?? opt.id,
          text: opt.text,
          sortOrder: opt.sortOrder ?? sort++
        });
      }
    }
  }
}

async function main() {
  try {
    console.log('SEED megkezd');

    // Először drop + create minden tábla
    await resetSchema();

    // Aztán mehetnek az adatok
    await seedUsers();
    await seedTananyagFromJson();
    await seedQuizFromJson();

    console.log('SEED kész!');
  } catch (err) {
    console.error('Hiba seeding közben:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
