// src/routes/tananyag/[id]/+page.server.ts
import { getChapterContextById, getSourcesForChapter } from '$lib/tananyag/anyag';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  try {
    const [{ chapter, prev, next }, sources] = await Promise.all([
      getChapterContextById(id),
      getSourcesForChapter(id)
    ]);

    return { chapter, prev, next, sources };
  } catch (err) {
    throw error(404, 'A kért tananyag fejezet nem található.');
  }
};
