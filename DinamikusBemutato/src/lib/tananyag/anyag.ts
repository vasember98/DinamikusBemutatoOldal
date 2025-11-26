// src/lib/anyag/anyag.ts
import { db } from '$lib/server/db'; // <- ezt írd át a saját db kliensedre, ha más
import {
  tananyag as tananyagTable,
  chapters as chaptersTable,
  chapterSources
} from '$lib/server/db/schema'; // <- ezt is igazítsd
import { eq, inArray } from 'drizzle-orm';

import type {
  Source,
  Chapter,
  ChapterContext,
  ResolvedLink,
  TananyagRoot,
  PrevNextRef
} from './anyag.types';

const TANANYAG_ID = 'tananyag';

// Drizzle select típusok
type ChapterRow = typeof chaptersTable.$inferSelect;
type TananyagRow = typeof tananyagTable.$inferSelect;
type ChapterSourceRow = typeof chapterSources.$inferSelect;

/**
 * Tananyag gyökér lekérése DB-ből
 */
async function getTananyagRow(): Promise<TananyagRow> {
  const rows = await db
    .select()
    .from(tananyagTable)
    .where(eq(tananyagTable.id, TANANYAG_ID))
    .limit(1);

  if (!rows[0]) {
    throw new Error('Tananyag root (id=tananyag) nem található az adatbázisban.');
  }

  return rows[0];
}

/**
 * Tananyag gyökérútvonal (pl. /tananyag)
 */
export async function getTananyagBasePath(): Promise<string> {
  const root = await getTananyagRow();
  return root.basePath;
}

/**
 * Chapter sorok → domain Chapter-ek + sources
 */
async function hydrateChapters(rows: ChapterRow[]): Promise<Chapter[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  const sourceRows: ChapterSourceRow[] = await db
    .select()
    .from(chapterSources)
    .where(inArray(chapterSources.chapterId, ids));

  const sourcesByChapter = new Map<string, Source[]>();

  for (const s of sourceRows) {
    const list = sourcesByChapter.get(s.chapterId) ?? [];
    list.push({
      file: s.file,
      fromSlide: s.fromSlide,
      toSlide: s.toSlide
    });
    sourcesByChapter.set(s.chapterId, list);
  }

  return rows.map<Chapter>((row) => ({
    id: row.id,
    title: row.title,
    path: row.path,
    summary: row.summary,
    sources: sourcesByChapter.get(row.id) ?? [],
    prev: row.prevTargetId
      ? {
          id: row.prevTargetId,
          label: row.prevLabel ?? undefined
        }
      : undefined,
    next: row.nextTargetId
      ? {
          id: row.nextTargetId,
          label: row.nextLabel ?? undefined
        }
      : undefined
  }));
}

/**
 * Összes fejezet listázása (pl. menühöz).
 */
export async function getChapters(): Promise<Chapter[]> {
  const rows = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.tananyagId, TANANYAG_ID));
  // ha akarsz, itt rendezhetsz: .orderBy(asc(chaptersTable.id))

  return hydrateChapters(rows);
}

/**
 * Egy fejezet kikeresése id alapján.
 */
export async function getChapterById(id: string): Promise<Chapter | undefined> {
  const rows = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.id, id))
    .limit(1);

  if (!rows[0]) return undefined;

  const [chapter] = await hydrateChapters([rows[0]]);
  return chapter;
}

/**
 * Egy fejezet kikeresése path alapján.
 * Pl. /tananyag/moho-strategia
 */
export async function getChapterByPath(path: string): Promise<Chapter | undefined> {
  const rows = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.path, path))
    .limit(1);

  if (!rows[0]) return undefined;

  const [chapter] = await hydrateChapters([rows[0]]);
  return chapter;
}

/**
 * Prev/next hivatkozás feloldása:
 * - ha id === 'tananyag' → tananyag áttekintő
 * - ha chapter id → annak path + title
 * - ha nem található → fallback tananyag áttekintő
 */
async function resolveLink(ref: PrevNextRef | undefined | null): Promise<ResolvedLink> {
  const basePath = await getTananyagBasePath();

  if (!ref) {
    return {
      href: basePath,
      label: 'Tananyag áttekintés',
      targetId: TANANYAG_ID
    };
  }

  if (ref.id === TANANYAG_ID) {
    return {
      href: basePath,
      label: ref.label ?? 'Tananyag áttekintés',
      targetId: TANANYAG_ID
    };
  }

  const chapter = await getChapterById(ref.id);

  if (!chapter) {
    return {
      href: basePath,
      label: ref.label ?? 'Tananyag áttekintés',
      targetId: TANANYAG_ID
    };
  }

  return {
    href: chapter.path,
    label: ref.label ?? chapter.title,
    targetId: chapter.id
  };
}

/**
 * ChapterContext id alapján:
 * - visszaadja a chapter-t
 * - prev/next feloldva (always ResolvedLink, fallback /tananyag)
 */
export async function getChapterContextById(id: string): Promise<ChapterContext> {
  const chapter = await getChapterById(id);
  if (!chapter) {
    throw new Error(`Chapter not found for id: ${id}`);
  }

  const [prev, next] = await Promise.all([
    resolveLink(chapter.prev ?? null),
    resolveLink(chapter.next ?? null)
  ]);

  return { chapter, prev, next };
}

/**
 * Ugyanez path alapján (ha route-ból dolgozol).
 */
export async function getChapterContextByPath(path: string): Promise<ChapterContext> {
  const chapter = await getChapterByPath(path);
  if (!chapter) {
    throw new Error(`Chapter not found for path: ${path}`);
  }

  const [prev, next] = await Promise.all([
    resolveLink(chapter.prev ?? null),
    resolveLink(chapter.next ?? null)
  ]);

  return { chapter, prev, next };
}

/**
 * Sources egy chapterhez (külön is kérhető, bár a Chapter-ben már benne van)
 */
export async function getSourcesForChapter(id: string): Promise<Source[]> {
  const chapter = await getChapterById(id);
  return chapter?.sources ?? [];
}

/**
 * Ha valahol kellene teljes TananyagRoot (pl. API-hoz), ilyesmit csinálhatsz:
 */
export async function getTananyagRoot(): Promise<TananyagRoot> {
  const basePath = await getTananyagBasePath();
  const chapters = await getChapters();
  return { basePath, chapters };
}
