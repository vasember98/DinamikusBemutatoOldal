<script lang="ts">
  import type { Snippet } from 'svelte';
  import { get } from 'svelte/store';

  import NodeBase from './NodeBase.svelte';
  import NodeHost from './NodeHost.svelte';

  import {
    childrenOf,
    layoutOf,
    moveNode,
    setPosition,
    positionOf,
    isDescendant
  } from '$lib/diagram/store';

  import type { NodeId, Layout } from '$lib/diagram/types';
  import { drag, type DragState } from '$lib/dnd/DragManager';

  type Props = { id: NodeId; class?: string; layout?: Layout; children?: Snippet };
  let { id, class: className = '', layout }: Props = $props();

  const childIds = childrenOf(id);

  // DOM refs
  let containerEl = $state<HTMLElement | null>(null);
  const elById = new Map<NodeId, HTMLElement>();

  const zoneLayout = $derived(() => layout ?? layoutOf(id));
  let isHover = $state(false);

  function canAccept(d: DragState | null): d is DragState & { payload: { kind: 'move-node'; id: NodeId } } {
    if (!d || d.payload?.kind !== 'move-node') return false;
    const moving = d.payload.id as NodeId;
    if (moving === id) return false;
    // don't allow dropping a parent into its own descendant
    if (isDescendant(moving, id)) return false;
    return true;
  }

  function computeVerticalIndex(pointerY: number): number {
    const ids = get(childIds);
    if (!ids.length) return 0;

    const mids = ids
      .map((cid) => {
        const el = elById.get(cid);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return (r.top + r.bottom) / 2;
      })
      .filter((n): n is number => n != null);

    for (let i = 0; i < mids.length; i++) {
      if (pointerY < mids[i]) return i;
    }
    return mids.length;
  }

  function toLocalXY(clientX: number, clientY: number) {
    const host = containerEl?.getBoundingClientRect();
    if (!host) return { x: 0, y: 0 };
    return { x: clientX - host.left, y: clientY - host.top };
  }

  function positionFor(nid: NodeId) {
    return get(positionOf(nid)) ?? { x: 0, y: 0 };
  }

  function handleDragEnter() { isHover = true; }
  function handleDragLeave() { isHover = false; }

  function handleDrop(e: CustomEvent<any>) {
    isHover = false;
    const d = get(drag) as DragState | null;
    if (!canAccept(d)) return;

    const px = d.pointer?.x ?? e.detail?.x ?? 0;
    const py = d.pointer?.y ?? e.detail?.y ?? 0;

    if (zoneLayout === 'vertical') {
      const idx = computeVerticalIndex(py);
      moveNode({ id: d.payload.id, toParent: id, toIndex: idx });
    } else {
      const { x, y } = toLocalXY(px, py);
      moveNode({ id: d.payload.id, toParent: id }); // append
      setPosition(d.payload.id, { x, y });
    }
  }
</script>

<NodeBase
  id={id}
  droppable
  draggable={false}
  class={`relative rounded-md border border-neutral-200 dark:border-neutral-800
          ${isHover ? 'ring-2 ring-blue-400' : ''}
          ${zoneLayout === 'vertical' ? 'p-2 flex flex-col gap-2' : 'p-2'}
          ${className}`}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  {#snippet children}
    <div class="relative" bind:this={containerEl}>
      {#if zoneLayout === 'vertical'}
        {#each $childIds as childId (childId)}
          <div
            class="min-h-[2rem]"
            bind:this={(el) => { if (el) elById.set(childId, el); }}
          >
            <NodeHost id={childId} />
          </div>
        {/each}
        {#if !$childIds.length}
          <div class="text-xs text-neutral-500 select-none">Drop here</div>
        {/if}
      {:else}
        <div class="relative min-h-[120px]">
          {#each $childIds as childId (childId)}
            {#key childId}
              <div
                class="absolute"
                style={`left:${positionFor(childId).x}px;top:${positionFor(childId).y}px`}
                bind:this={(el) => { if (el) elById.set(childId, el); }}
              >
                <NodeHost id={childId} />
              </div>
            {/key}
          {/each}
          {#if !$childIds.length}
            <div class="text-xs text-neutral-500 select-none">Drop to place</div>
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}
</NodeBase>
