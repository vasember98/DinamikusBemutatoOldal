import { getChapterContextById, getSourcesForChapter } from '$lib/tananyag/anyag';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  const { id } = params;

  const { chapter, prev, next } = getChapterContextById(id);
  if (!chapter) {
    throw error(404, 'A kért tananyag fejezet nem található.');
  }

  const sources = getSourcesForChapter(id);

  return { chapter, prev, next, sources };
};
