import type { PageLoad } from './$types';
import { getChapters, getTananyagBasePath } from '$lib/tananyag/anyag';

export const load: PageLoad = () => {
  const basePath = getTananyagBasePath();
  const chapters = getChapters();

  return {
    basePath,
    chapters
  };
};
