import type { SidebarNode } from '$lib/types/sidebar';
const strip = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);
export function matchHref(href: string | undefined, url: URL) {
  if (!href) return 'none' as const;
  const cur = url.pathname.replace(/\/+$/, '');
  const target = new URL(href, url).pathname.replace(/\/+$/, '');
  if (cur === target) return 'exact' as const;
  if (cur.startsWith(target + '/')) return 'ancestor' as const;
  return 'none' as const;
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
