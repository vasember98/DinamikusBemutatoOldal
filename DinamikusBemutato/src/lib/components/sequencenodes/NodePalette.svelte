<script lang="ts">
  import InputNodeItem from '$lib/components/sequencenodes/paletteitems/InputNodePaletteItem.svelte';
  import OutputNodeItem from '$lib/components/sequencenodes/paletteitems/OutputNodePaletteItem.svelte';

  let {
    compact = false,
    onCreateNode
  } = $props<{ compact?: boolean; onCreateNode?: (p: import('$lib/types/nodes').NodeCreatePayload) => void }>();
</script>

<aside
  class={`w-full ${compact ? '' : 'min-w-60'} rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950`}
  aria-label="Node palette"
>
  <header class="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
    <h3 class="text-sm font-semibold">Nodes</h3>
  </header>

  <div class="p-2 grid gap-2">
    <InputNodeItem onCreate={onCreateNode} />
    <OutputNodeItem onCreate={onCreateNode} />
  </div>

  <footer class="px-3 pb-3">
    <p class="text-xs text-neutral-500">
      Drag items onto the canvas to add them. Nodes on the canvas are draggable but not drop targets.
    </p>
  </footer>
</aside>
