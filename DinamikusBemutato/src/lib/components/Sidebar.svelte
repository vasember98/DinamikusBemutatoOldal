<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
  // keep your imports
  import { page } from '$app/state'; // if you actually mean $app/stores, keep that
  import { computeActiveSets } from '$lib/stores/activeRoute';
  import type { SidebarNode } from '$lib/types/sidebar';
  import SidebarItem from './SidebarItem.svelte';
  import { expanded } from '$lib/stores/collapse';
  import { menuNodes } from '$lib/stores/menus';

  // NEW: visibility controls (from your existing ui.ts)
  import { sidebarVisible, useOverlaySidebar, closeSidebar } from '$lib/stores/ui';

  // Optional override: if you ever want to pass nodes explicitly.
  export let nodes: SidebarNode[] | null = null;

  // What we actually render (prop takes precedence, else store)
  $: renderNodes = nodes ?? $menuNodes;

  // Collect IDs of all collapsible nodes (those that have children)
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

  // Auto-expand only the active branch whenever URL or nodes change
  $: {
    const { ancestors } = computeActiveSets(renderNodes ?? [], page.url);
    const targetToOpen = allCollapsibleIds.filter((id) => ancestors.has(id));
    expanded.setMany(allCollapsibleIds, false);
    if (targetToOpen.length) expanded.setMany(targetToOpen, true);
  }

  // a11y: ESC to close only when acting as overlay (mobile)
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && $useOverlaySidebar) closeSidebar();
  }
</script>

<!-- Overlay (mobile / narrow only) -->
{#if $useOverlaySidebar && $sidebarVisible}
  <div
    class="fixed inset-x-0 bottom-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
    style="top: var(--nav-h);"   
    aria-hidden="true"
    on:click={closeSidebar}
  ></div>
{/if}

<!-- Panel -->
<aside
id="app-sidebar"
  aria-label="Sidebar navigation"
  tabindex="-1"
  class="
    z-40 w-72 shrink-0 border-r border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950
    transition-transform duration-200 ease-in-out
    lg:static
    lg:translate-x-0
    /* below the nav on small screens; normal flow on lg+ */
    fixed left-0 right-auto"
  style="top: var(--nav-h); bottom: 0;"  
  class:translate-x-0={$useOverlaySidebar && $sidebarVisible}
  class:-translate-x-full={$useOverlaySidebar && !$sidebarVisible}
>
  <!-- Header / toolbar -->
  <div class="mb-3 flex items-center justify-between gap-2 px-1">
    <div class="flex items-center gap-1">
      <button
        class="rounded-md px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary"
        on:click={expandAll}
        aria-label="Expand all"
      >
        Expand all
      </button>
      <button
        class="rounded-md px-2 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary"
        on:click={collapseAll}
        aria-label="Collapse all"
      >
        Collapse all
      </button>
    </div>
  </div>

  {#if renderNodes?.length}
    <nav aria-label="Main navigation">
      <ul role="tree" aria-multiselectable="false" class="list-none m-0 p-0 space-y-1">
        {#each renderNodes as node (node.id)}
          <SidebarItem item={node} />
        {/each}
      </ul>
    </nav>
  {:else}
    <div class="px-3 py-2 text-xs text-neutral-400">No menu items</div>
  {/if}
</aside>
