// src/lib/stores/activeRoute.ts
import type { SidebarNode } from '$lib/types/sidebar';

const strip = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);

export function matchHref(href: string | undefined, url: URL): 'exact' | 'ancestor' | 'none' {
  if (!href) return 'none';
  if (href.startsWith('#')) return url.hash === href ? 'exact' : 'none';
  if (/^https?:\/\//i.test(href)) return href === url.href ? 'exact' : 'none';

  const target = new URL(href, url);
  const a = strip(target.pathname);
  const b = strip(url.pathname);
  if (a === b) return 'exact';
  return a !== '/' && b.startsWith(a + '/') ? 'ancestor' : 'none';
}

export function computeActiveSets(nodes: SidebarNode[], url: URL) {
  const active = new Set<string>();
  const ancestors = new Set<string>();
  const walk = (n: SidebarNode, chain: string[]) => {
    const res = matchHref(n.href, url);
    if (res === 'exact') {
      active.add(n.id);
      chain.forEach((id) => ancestors.add(id));
    } else if (res === 'ancestor') {
      ancestors.add(n.id);
    }
    n.children?.forEach((c) => walk(c, [...chain, n.id]));
  };
  nodes.forEach((n) => walk(n, []));
  return { active, ancestors };
}
