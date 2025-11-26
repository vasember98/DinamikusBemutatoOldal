<script lang="ts">
  type Filter = 'all' | 'unread' | 'system' | 'mentions';
  export let activeFilter: Filter = 'all';
  export let unreadCount = 0;
  export let onChangeFilter: (filter: Filter) => void;
  const filters: {
    id: Filter;
    label: string;
    showBadge?: boolean;
  }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', showBadge: true },
    { id: 'system', label: 'System' },
    { id: 'mentions', label: 'Mentions' }
  ];
  function select(filter: Filter) {
    onChangeFilter && onChangeFilter(filter);
  }
</script>
<div class="flex flex-wrap gap-2 text-[11px]">
  {#each filters as f}
    {#if f.id === activeFilter}
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full px-3 py-1 border border-emerald-500/70 bg-emerald-500/10 text-emerald-300"
        on:click={() => select(f.id)}
      >
        <span>{f.label}</span>
        {#if f.showBadge && unreadCount > 0}
          <span class="rounded-full bg-emerald-500/20 px-1.5 text-[9px] text-emerald-300">
            {unreadCount}
          </span>
        {/if}
      </button>
    {:else}
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full px-3 py-1 border border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
        on:click={() => select(f.id)}
      >
        <span>{f.label}</span>
      </button>
    {/if}
  {/each}
</div>
