<script lang="ts">
  import NodeBase from '$lib/components/sequencenodes/nodes/NodeBase.svelte';
  type DropDetail = { sourceId: string; targetId: string; pointer: { x: number; y: number } };
  let lastEdited = $state<string | null>(null);
  let overA = $state(false);
  let overB = $state(false);
  let palette = $state<string[]>(['input-1', 'input-2']);
  let zoneA = $state<string[]>([]);
  let zoneB = $state<string[]>([]);
  function onEdit(e: CustomEvent<{ id: string }>) {
    lastEdited = e.detail.id;
  }
  function moveNodeTo(targetId: 'palette' | 'zone-a' | 'zone-b', nodeId: string) {
    palette = palette.filter((x) => x !== nodeId);
    zoneA   = zoneA.filter((x) => x !== nodeId);
    zoneB   = zoneB.filter((x) => x !== nodeId);
    if (targetId === 'palette') palette = [...palette, nodeId];
    if (targetId === 'zone-a')  zoneA   = [...zoneA, nodeId];
    if (targetId === 'zone-b')  zoneB   = [...zoneB, nodeId];
  }
  function onDropA(e: CustomEvent<DropDetail>) {
    moveNodeTo('zone-a', e.detail.sourceId);
  }
  function onDropB(e: CustomEvent<DropDetail>) {
    moveNodeTo('zone-b', e.detail.sourceId);
  }
  function onDropPalette(e: CustomEvent<DropDetail>) {
    moveNodeTo('palette', e.detail.sourceId);
  }
  function resetAll() {
    palette = ['input-1', 'input-2'];
    zoneA = [];
    zoneB = [];
    lastEdited = null;
    overA = overB = false;
  }
</script>
<div class="mx-auto max-w-5xl p-6">
  <header class="mb-6 flex items-center justify-between gap-4">
    <div>
      <h1 class="text-lg font-semibold">Drag &amp; Drop Demo</h1>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        Click = <span class="font-medium">edit</span>, press-and-hold = <span class="font-medium">drag</span>.
      </p>
      {#if lastEdited}
        <p class="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
          Last edited: <code>{lastEdited}</code>
        </p>
      {/if}
    </div>
    <button
      type="button"
      class="rounded-md border px-3 py-1.5 text-sm shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
      onclick={resetAll}
    >
      Reset
    </button>
  </header>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-4">
      <NodeBase
        id="palette"
        droppable
        class="p-3 min-h-[10rem]"
        ondrop={onDropPalette}
      >
        {#snippet children()}
          <h3 class="text-sm font-medium mb-2">Palette</h3>
          {#if palette.length === 0}
            <p class="text-xs text-neutral-500">No nodes here. Drop from zones to return.</p>
          {:else}
            <div class="space-y-3">
              {#each palette as nid (nid)}
                <NodeBase id={nid} draggable class="p-3" onedit={onEdit}>
                  {#snippet children()}
                    <h3 class="text-sm font-medium">{nid.replace('-', ' ').toUpperCase()}</h3>
                    <p class="text-xs text-neutral-500">Click to edit • Hold to drag</p>
                  {/snippet}
                </NodeBase>
              {/each}
            </div>
          {/if}
        {/snippet}
      </NodeBase>
    </div>
    <div class="space-y-4">
      <NodeBase
        id="zone-a"
        droppable
        class={`p-3 min-h-[10rem] ${overA ? 'ring-2 ring-emerald-400/60' : ''}`}
        ondragenter={() => (overA = true)}
        ondragleave={() => (overA = false)}
        ondrop={onDropA}
      >
        {#snippet children()}
          <h3 class="text-sm font-medium mb-2">Drop Zone A</h3>
          {#if zoneA.length === 0}
            <p class="text-xs text-neutral-500">Drop inputs here…</p>
          {:else}
            <div class="space-y-3">
              {#each zoneA as nid (nid)}
                <NodeBase id={nid} draggable class="p-3" onedit={onEdit}>
                  {#snippet children()}
                    <h3 class="text-sm font-medium">{nid.replace('-', ' ').toUpperCase()}</h3>
                    <p class="text-xs text-neutral-500">Inside Zone A • Click to edit • Hold to drag</p>
                  {/snippet}
                </NodeBase>
              {/each}
            </div>
          {/if}
        {/snippet}
      </NodeBase>
      <NodeBase
        id="zone-b"
        droppable
        class={`p-3 min-h-[10rem] ${overB ? 'ring-2 ring-emerald-400/60' : ''}`}
        ondragenter={() => (overB = true)}
        ondragleave={() => (overB = false)}
        ondrop={onDropB}
      >
        {#snippet children()}
          <h3 class="text-sm font-medium mb-2">Drop Zone B</h3>
          {#if zoneB.length === 0}
            <p class="text-xs text-neutral-500">Drop inputs here…</p>
          {:else}
            <div class="space-y-3">
              {#each zoneB as nid (nid)}
                <NodeBase id={nid} draggable class="p-3" onedit={onEdit}>
                  {#snippet children()}
                    <h3 class="text-sm font-medium">{nid.replace('-', ' ').toUpperCase()}</h3>
                    <p class="text-xs text-neutral-500">Inside Zone B • Click to edit • Hold to drag</p>
                  {/snippet}
                </NodeBase>
              {/each}
            </div>
          {/if}
        {/snippet}
      </NodeBase>
    </div>
  </div>
</div>
