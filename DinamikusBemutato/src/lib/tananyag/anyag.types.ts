// src/lib/anyag/anyag.types.ts

export type PrevNextRef = {
	id: string; // 'tananyag' vagy chapter id
	label?: string;
};

export type Source = {
	file: string;
	fromSlide: number;
	toSlide: number;
};

export type Chapter = {
	id: string;
	title: string;
	path: string;
	summary: string;
	sources: Source[];
	prev?: PrevNextRef | null;
	next?: PrevNextRef | null;
};

export type TananyagRoot = {
	basePath: string;
	chapters: Chapter[];
};

export type TananyagContentMap = {
	tananyag: TananyagRoot;
};

export type ResolvedLink = {
	href: string;
	label: string;
	targetId?: string; // convenience: mire mutat (chapter id vagy 'tananyag')
};

export type ChapterContext = {
	chapter: Chapter;
	prev: ResolvedLink;
	next: ResolvedLink;
};
