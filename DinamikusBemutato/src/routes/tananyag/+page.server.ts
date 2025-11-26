// src/routes/tananyag/+page.server.ts
import type { PageServerLoad } from './$types';
import { getChapters, getTananyagBasePath } from '$lib/tananyag/anyag';

export const load: PageServerLoad = async () => {
  const [basePath, chapters] = await Promise.all([
    getTananyagBasePath(),
    getChapters()
  ]);

  return {
    basePath,
    chapters
  };
};
