<script lang="ts">
  import { page } from '$app/state';
  import { expanded } from '$lib/stores/collapse';
  import { menuNodes } from '$lib/stores/menus';
  import { computeActiveSets } from '$lib/stores/activeRoute';
  import SidebarItem from './SidebarItem.svelte';
  import type { SidebarNode } from '$lib/types/sidebar';
  let { nodes = null } = $props<{ nodes?: SidebarNode[] | null }>();
  let renderNodes = $derived(nodes ?? $menuNodes);
  function collectCollapsibleIds(list: SidebarNode[] | undefined, acc: Set<string>) {
    if (!list) return;
    for (const n of list) {
      const hasChildren = !!(n.children && n.children.length);
      const collapsible = (n as any).collapsible ?? hasChildren;
      if (collapsible && hasChildren) acc.add(n.id);
      if (hasChildren) collectCollapsibleIds(n.children, acc);
    }
  }
  function getAllCollapsibleIds(list?: SidebarNode[]): string[] {
  const s = new Set<string>();
  collectCollapsibleIds(list, s);
  return [...s];
}
let allCollapsibleIds = $derived(getAllCollapsibleIds(renderNodes));
  const expandAll = () => expanded.setMany(allCollapsibleIds, true);
  const collapseAll = () => expanded.setMany(allCollapsibleIds, false);
  $effect(() => {
    const { ancestors } = computeActiveSets(renderNodes ?? [], page.url);
    const toOpen = allCollapsibleIds.filter((id) => ancestors.has(id));
    expanded.setMany(allCollapsibleIds, false);
    if (toOpen.length) expanded.setMany(toOpen, true);
  });
</script>
<div class="w-full p-3">
  <div class="mb-3 flex items-center gap-2">
    <button class="rounded-md px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2"
            onclick={expandAll} aria-label="Expand all">
      Expand all
    </button>
    <button class="rounded-md px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2"
            onclick={collapseAll} aria-label="Collapse all">
      Collapse all
    </button>
  </div>
  {#if renderNodes?.length}
    <nav aria-label="Main navigation">
      <ul role="tree" aria-multiselectable="false" class="m-0 list-none space-y-1 p-0">
        {#each renderNodes as node (node.id)}
          <SidebarItem item={node} />
        {/each}
      </ul>
    </nav>
  {:else}
    <div class="px-3 py-2 text-xs text-neutral-400">No menu items</div>
  {/if}
</div>
