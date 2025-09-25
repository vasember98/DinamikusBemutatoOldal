<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { computeActiveSets } from '$lib/stores/activeRoute';
  import type { SidebarNode } from '$lib/types/sidebar';
  import SidebarItem from '$lib/components/navigation/SidebarItem.svelte';
  import { expanded } from '$lib/stores/collapse';
  import { menuNodes } from '$lib/stores/menus';

  export let nodes: SidebarNode[] | null = null;

  $: renderNodes = nodes ?? $menuNodes;

  function collectCollapsibleIds(list: SidebarNode[] | undefined, acc: Set<string>) {
    if (!list) return;
    for (const n of list) {
      const hasChildren = !!(n.children && n.children.length);
      const collapsible = (n as any).collapsible ?? hasChildren;
      if (collapsible && hasChildren) acc.add(n.id);
      if (hasChildren) collectCollapsibleIds(n.children, acc);
    }
  }

  $: allCollapsibleIds = (() => {
    const s = new Set<string>();
    collectCollapsibleIds(renderNodes, s);
    return [...s];
  })();

  const expandAll = () => expanded.setMany(allCollapsibleIds, true);
  const collapseAll = () => expanded.setMany(allCollapsibleIds, false);

  $: {
    const { ancestors } = computeActiveSets(renderNodes ?? [], page.url);
    const targetToOpen = allCollapsibleIds.filter((id) => ancestors.has(id));
    expanded.setMany(allCollapsibleIds, false);
    if (targetToOpen.length) expanded.setMany(targetToOpen, true);
  }
</script>

<!-- PURE CONTENT: no fixed/sticky/z/translate here -->
<div class="w-full p-3">
  <div class="mb-3 flex items-center gap-2">
    <button class="rounded-md px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2"
            on:click={expandAll} aria-label="Expand all">
      Expand all
    </button>
    <button class="rounded-md px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2"
            on:click={collapseAll} aria-label="Collapse all">
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
