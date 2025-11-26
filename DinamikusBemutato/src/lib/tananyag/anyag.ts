import { db } from '$lib/server/db';
import {
  tananyag as tananyagTable,
  chapters as chaptersTable,
  chapterSources
} from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import type {
  Source,
  Chapter,
  ChapterContext,
  ResolvedLink,
  TananyagRoot,
  PrevNextRef
} from './anyag.types';

const TANANYAG_ROOT_ID = 'tananyag';

type ChapterRow = typeof chaptersTable.$inferSelect;
type TananyagRow = typeof tananyagTable.$inferSelect;
type ChapterSourceRow = typeof chapterSources.$inferSelect;

async function fetchTananyagRoot(): Promise<TananyagRow> {
  const result = await db
    .select()
    .from(tananyagTable)
    .where(eq(tananyagTable.id, TANANYAG_ROOT_ID))
    .limit(1);
    
  if (!result || result.length === 0) {
    throw new Error('Tananyag root (id=tananyag) nem található az adatbázisban.');
  }
  
  return result[0];
}

export async function getTananyagBasePath(): Promise<string> {
  const tananyagRoot = await fetchTananyagRoot();
  return tananyagRoot.basePath;
}

async function attachSourcesToChapters(chapterRows: ChapterRow[]): Promise<Chapter[]> {
  if (chapterRows.length === 0) {
    return [];
  }
  
  const chapterIds = chapterRows.map((row) => row.id);
  
  const sources = await db
    .select()
    .from(chapterSources)
    .where(inArray(chapterSources.chapterId, chapterIds));
  
  const sourcesMap = new Map<string, Source[]>();
  
  sources.forEach(src => {
    const existing = sourcesMap.get(src.chapterId);
    const sourceObj: Source = {
      file: src.file,
      fromSlide: src.fromSlide,
      toSlide: src.toSlide
    };
    
    if (existing) {
      existing.push(sourceObj);
    } else {
      sourcesMap.set(src.chapterId, [sourceObj]);
    }
  });
  
  const chapters: Chapter[] = chapterRows.map((row) => {
    const chapterSources = sourcesMap.get(row.id) || [];
    
    const prevLink = row.prevTargetId ? {
      id: row.prevTargetId,
      label: row.prevLabel ?? undefined
    } : undefined;
    
    const nextLink = row.nextTargetId ? {
      id: row.nextTargetId,
      label: row.nextLabel ?? undefined
    } : undefined;
    
    return {
      id: row.id,
      title: row.title,
      path: row.path,
      summary: row.summary,
      sources: chapterSources,
      prev: prevLink,
      next: nextLink
    };
  });
  
  return chapters;
}
export async function getChapters(): Promise<Chapter[]> {
  const allChapters = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.tananyagId, TANANYAG_ROOT_ID));
    
  return attachSourcesToChapters(allChapters);
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
  const result = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.id, id))
    .limit(1);
    
  if (!result[0]) {
    return undefined;
  }
  
  const chapters = await attachSourcesToChapters([result[0]]);
  return chapters[0];
}

export async function getChapterByPath(path: string): Promise<Chapter | undefined> {
  const result = await db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.path, path))
    .limit(1);
    
  if (!result || result.length === 0) {
    return undefined;
  }
  
  const withSources = await attachSourcesToChapters([result[0]]);
  return withSources[0];
}

async function buildNavigationLink(ref: PrevNextRef | undefined | null): Promise<ResolvedLink> {
  const baseUrl = await getTananyagBasePath();
  
  if (!ref) {
    return {
      href: baseUrl,
      label: 'Tananyag áttekintés',
      targetId: TANANYAG_ROOT_ID
    };
  }
  
  if (ref.id === TANANYAG_ROOT_ID) {
    const linkLabel = ref.label || 'Tananyag áttekintés';
    return {
      href: baseUrl,
      label: linkLabel,
      targetId: TANANYAG_ROOT_ID
    };
  }
  
  const targetChapter = await getChapterById(ref.id);
  
  if (!targetChapter) {
    return {
      href: baseUrl,
      label: ref.label ?? 'Tananyag áttekintés',
      targetId: TANANYAG_ROOT_ID
    };
  }
  
  const displayLabel = ref.label ? ref.label : targetChapter.title;
  
  return {
    href: targetChapter.path,
    label: displayLabel,
    targetId: targetChapter.id
  };
}
export async function getChapterContextById(id: string): Promise<ChapterContext> {
  const chapter = await getChapterById(id);
  
  if (!chapter) {
    throw new Error(`Chapter not found for id: ${id}`);
  }
  
  const prevRef = chapter.prev ?? null;
  const nextRef = chapter.next ?? null;
  
  const prevLink = await buildNavigationLink(prevRef);
  const nextLink = await buildNavigationLink(nextRef);
  
  return { 
    chapter, 
    prev: prevLink, 
    next: nextLink 
  };
}

export async function getChapterContextByPath(path: string): Promise<ChapterContext> {
  const chapter = await getChapterByPath(path);
  
  if (!chapter) {
    throw new Error(`Chapter not found for path: ${path}`);
  }
  
  const [prevLink, nextLink] = await Promise.all([
    buildNavigationLink(chapter.prev ?? null),
    buildNavigationLink(chapter.next ?? null)
  ]);
  
  return { chapter, prev: prevLink, next: nextLink };
}

export async function getSourcesForChapter(id: string): Promise<Source[]> {
  const chapter = await getChapterById(id);
  
  if (!chapter) {
    return [];
  }
  
  return chapter.sources;
}

export async function getTananyagRoot(): Promise<TananyagRoot> {
  const baseUrl = await getTananyagBasePath();
  const allChapters = await getChapters();
  
  return { 
    basePath: baseUrl, 
    chapters: allChapters 
  };
}
