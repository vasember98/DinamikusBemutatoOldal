export type PrevNextRef = {
	id: string;
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
	targetId?: string;
};
export type ChapterContext = {
	chapter: Chapter;
	prev: ResolvedLink;
	next: ResolvedLink;
};
