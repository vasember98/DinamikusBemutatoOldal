import type { SidebarNode } from '$lib/types/sidebar';

export function matchHref(href: string | undefined, url: URL) {
  if (!href) return 'none' as const;
  
  const currentPath = url.pathname.replace(/\/+$/, '');
  const targetPath = new URL(href, url).pathname.replace(/\/+$/, '');
  
  if (currentPath === targetPath) {
    return 'exact' as const;
  }
  
  if (currentPath.startsWith(targetPath + '/')) {
    return 'ancestor' as const;
  }
  
  return 'none' as const;
}

export function computeActiveSets(nodes: SidebarNode[], url: URL) {
  const activeSet = new Set<string>();
  const ancestorSet = new Set<string>();
  
  function walkNodes(node: SidebarNode, parentChain: string[]) {
    const matchResult = matchHref(node.href, url);
    
    if (matchResult === 'exact') {
      activeSet.add(node.id);
      for (const parentId of parentChain) {
        ancestorSet.add(parentId);
      }
    } else if (matchResult === 'ancestor') {
      ancestorSet.add(node.id);
    }
    
    if (node.children) {
      const newChain = [...parentChain, node.id];
      for (const child of node.children) {
        walkNodes(child, newChain);
      }
    }
  }
  
  for (const node of nodes) {
    walkNodes(node, []);
  }
  
  return { 
    active: activeSet, 
    ancestors: ancestorSet 
  };
}
