<script lang="ts">
  import type { SidebarNode } from '$lib/types/sidebar';
  import { page } from '$app/state';
  import { expanded } from '$lib/stores/collapse';
  import SidebarItem from './SidebarItem.svelte'
  let { item } = $props<{ item: SidebarNode }>();
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  let current  = $derived(norm(page.url.pathname));
  let target   = $derived(item.href ? norm(new URL(item.href, page.url).pathname) : '');
  let isClickable = $derived(!!item.href);
  let isActive    = $derived(isClickable && current === target);
  let isAncestor  = $derived(isClickable && target !== '/' && current.startsWith(target + '/'));
  const hasChildren = !!(item.children && item.children.length);
  const collapsible = (item as any).collapsible ?? hasChildren;
  const listId = `children-${item.id}`;
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' && hasChildren && !$expanded.has(item.id)) {
      e.preventDefault(); expanded.toggle(item.id, true);
    } else if (e.key === 'ArrowLeft' && hasChildren && $expanded.has(item.id)) {
      e.preventDefault(); expanded.toggle(item.id, false);
    }
  }
  const toggle = (e?: Event) => {
    e?.stopPropagation();
    expanded.toggle(item.id);
  };
</script>
<li class="group"
  role="treeitem"
  aria-expanded={hasChildren && collapsible ? $expanded.has(item.id) : undefined}
  aria-selected={isActive} 
  onkeydown={onKeydown}
  >
  <div
    class="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none"  >
    {#if hasChildren && collapsible}
      <button
        class="inline-flex h-7 w-7 items-center justify-center rounded-md
              text-neutral-500 hover:text-neutral-700
              hover:bg-neutral-100 dark:hover:bg-neutral-800
              focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400"
        aria-label={`Toggle ${item.label}`}
        aria-controls={listId}
        aria-expanded={$expanded.has(item.id)}
        onclick={toggle}
      >
        <svg
          class="h-4 w-4 transition-transform duration-200"
          viewBox="0 0 20 20"
          fill="currentColor"
          style={`transform: rotate(${$expanded.has(item.id) ? 90 : 0}deg)`}
          aria-hidden="true"
        >
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    {:else}
      <span class="inline-block h-7 w-7"></span>
    {/if}
    {#if isClickable}
      <a
        href={item.href}
        class="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm
         no-underline text-neutral-700 dark:text-neutral-200
         hover:bg-neutral-100 dark:hover:bg-neutral-800
         focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400
         {isActive ? 'bg-neutral-200 dark:bg-neutral-800 font-medium' : ''}
         {(!isActive && isAncestor) ? 'text-neutral-900 dark:text-neutral-100' : ''}"
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
      >
        <span class="truncate">{item.label}</span>
      </a>
    {:else}
      <div
        class="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-sm
         text-neutral-500 dark:text-neutral-400"
          aria-label={item.label}
          aria-disabled="true"
      >
        <span class="truncate">{item.label}</span>
      </div>
    {/if}
  </div>
  {#if hasChildren && $expanded.has(item.id)}
    {@const kids = item.children ?? []}
    <ul
      id={listId}
      role="group"
      class="list-none m-0 ml-3 mt-1 space-y-1 border-l border-neutral-200 pl-3 dark:border-neutral-700"
    >
      {#each kids as child (child.id)}
        <SidebarItem item={child} />
      {/each}
    </ul>
  {/if}
</li>
