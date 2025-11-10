// src/lib/anyag/anyag.ts
import anyagBontas from '$lib/tananyag/anyagBontas.json';
import type {
    Source,
	Chapter,
	ChapterContext,
	ResolvedLink,
	TananyagContentMap,
	PrevNextRef
} from './anyag.types';

const map = anyagBontas as TananyagContentMap;
const tananyag = map.tananyag;

const chaptersById = new Map<string, Chapter>(
	tananyag.chapters.map((ch) => [ch.id, ch])
);

const chaptersByPath = new Map<string, Chapter>(
	tananyag.chapters.map((ch) => [ch.path, ch])
);

const TANANYAG_ID = 'tananyag';

/**
 * Tananyag gyökérútvonal (pl. /tananyag)
 */
export function getTananyagBasePath(): string {
	return tananyag.basePath;
}

/**
 * Összes fejezet listázása (pl. menühöz).
 */
export function getChapters(): Chapter[] {
	return tananyag.chapters;
}

/**
 * Egy fejezet kikeresése id alapján.
 */
export function getChapterById(id: string): Chapter | undefined {
	return chaptersById.get(id);
}

/**
 * Egy fejezet kikeresése path alapján.
 * Pl. /tananyag/moho-strategia
 */
export function getChapterByPath(path: string): Chapter | undefined {
	return chaptersByPath.get(path);
}

/**
 * Prev/next hivatkozás feloldása:
 * - ha id === 'tananyag' → tananyag áttekintő
 * - ha chapter id → annak path + title
 * - ha nem található → fallback tananyag áttekintő
 */
function resolveLink(ref: PrevNextRef | undefined | null): ResolvedLink {
	const basePath = getTananyagBasePath();

	if (!ref) {
		return {
			href: basePath,
			label: 'Tananyag áttekintés',
			targetId: TANANYAG_ID
		};
	}

	// tananyag áttekintőre mutat
	if (ref.id === TANANYAG_ID) {
		return {
			href: basePath,
			label: ref.label ?? 'Tananyag áttekintés',
			targetId: TANANYAG_ID
		};
	}

	const chapter = getChapterById(ref.id);

	if (!chapter) {
		// ha elrontott id, akkor is legyen biztonságos fallback
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
export function getChapterContextById(id: string): ChapterContext {
	const chapter = getChapterById(id);
	if (!chapter) {
		throw new Error(`Chapter not found for id: ${id}`);
	}

	const prev = resolveLink(chapter.prev ?? null);
	const next = resolveLink(chapter.next ?? null);

	return { chapter, prev, next };
}

/**
 * Ugyanez path alapján (ha route-ból dolgozol).
 */
export function getChapterContextByPath(path: string): ChapterContext {
	const chapter = getChapterByPath(path);
	if (!chapter) {
		throw new Error(`Chapter not found for path: ${path}`);
	}

	const prev = resolveLink(chapter.prev ?? null);
	const next = resolveLink(chapter.next ?? null);

	return { chapter, prev, next };
}


export function getSourcesForChapter(id: string): Source[] {
	const chapter = getChapterById(id);
	return chapter?.sources ?? [];
}