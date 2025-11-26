<script lang="ts">
  import NodeBase from '$lib/components/sequencenodes/nodes/NodeBase.svelte';
  import { graph, children as gchildren, move, getNode, upsert } from '$lib/diagram/graph';
  import type { Layout, NodeId, NodeRecord } from '$lib/diagram/types';
  import { drag } from '$lib/dnd/DragManager';
  import type { DragState } from '$lib/dnd/DragManager';
  import { onDestroy } from 'svelte';
  type Props = {
    id: string;
    layout?: Layout;
    class?: string;
    header?: import('svelte').Snippet<[]>;
    empty?: import('svelte').Snippet<[]>;
    item?: import('svelte').Snippet<[ { id: string } ]>;
    ondragenter?: (e: CustomEvent<any>) => void;
    ondragleave?: (e: CustomEvent<any>) => void;
    ondrop?: (e: CustomEvent<{ sourceId: string; targetId: string; insertionIndex?: number }>) => void;
  };
  let {
    id,
    layout = 'vertical',
    class: className,
    header,
    empty,
    item,
    ondragenter,
    ondragleave,
    ondrop
  }: Props = $props();
  let host = $state<HTMLElement | null>(null);
  let dragState = $state<DragState | null>(null);
  const unsubDrag = drag.subscribe((v: DragState | null) => (dragState = v));
  onDestroy(unsubDrag);
  let childIds = $state<NodeId[]>([]);
  let unsubGraph: (() => void) | null = null;
  $effect(() => {
    unsubGraph?.();
    const sync = () => (childIds = gchildren(id).map((n: NodeRecord) => n.id));
    unsubGraph = graph.subscribe(sync);
    sync();
  });
  onDestroy(() => unsubGraph?.());
  const childEls = new Map<NodeId, HTMLElement>();
  function collect(node: HTMLElement, cid: NodeId) {
    childEls.set(cid, node);
    return {
      destroy() { childEls.delete(cid); }
    };
  }
  let over = $state(false);
  let insertionIndex = $state<number | null>(null);
  let lastPointer = $state<{ x: number; y: number } | null>(null);
  function recomputeIndex(clientY: number) {
    if (layout !== 'vertical') return;
    const rects = childIds
      .map((cid) => {
        const el = childEls.get(cid);
        return el ? { id: cid, rect: el.getBoundingClientRect() } : null;
      })
      .filter(Boolean) as Array<{ id: NodeId; rect: DOMRect }>;
    if (rects.length === 0) { insertionIndex = 0; return; }
    let idx = rects.findIndex((r) => clientY < (r.rect.top + r.rect.bottom) / 2);
    if (idx === -1) idx = rects.length;
    insertionIndex = idx;
  }
  function onWinMove(e: PointerEvent) {
    lastPointer = { x: e.clientX, y: e.clientY };
    if (over) recomputeIndex(e.clientY);
  }
  function handleEnter(e: CustomEvent<any>) {
    over = true;
    window.addEventListener('pointermove', onWinMove);
    if (lastPointer) recomputeIndex(lastPointer.y);
    ondragenter?.(e);
  }
  function handleLeave(e: CustomEvent<any>) {
    over = false;
    insertionIndex = null;
    window.removeEventListener('pointermove', onWinMove);
    ondragleave?.(e);
  }
  function handleDrop(
    e: CustomEvent<{ sourceId: string; landingXY?: { x: number; y: number } }>
  ) {
    const sourceId = e.detail?.sourceId;
    if (!sourceId) return;
    if (layout === 'vertical') {
      const idx = insertionIndex ?? childIds.length;
      move(sourceId, id, null, idx);
    } else {
      move(sourceId, id, null);
      const landing = e.detail.landingXY ?? lastPointer;
      const h = host;
      if (landing && h) {
        const r = h.getBoundingClientRect();
        const n = getNode(sourceId);
        if (n) {
          n.meta = { ...(n.meta ?? {}), x: landing.x - r.left, y: landing.y - r.top };
          upsert(n);
        }
      }
    }
    ondrop?.(
      new CustomEvent('drop', {
        detail: { sourceId, targetId: id, insertionIndex: insertionIndex ?? undefined }
      })
    );
    over = false;
    insertionIndex = null;
    window.removeEventListener('pointermove', onWinMove);
  }
  function barTopPx(): number {
    if (insertionIndex == null || !host) return 0;
    const hostTop = host.getBoundingClientRect().top;
    if (insertionIndex === 0) {
      const first = childEls.get(childIds[0]);
      return first ? first.getBoundingClientRect().top - hostTop : 0;
    }
    if (insertionIndex >= childIds.length) {
      const last = childEls.get(childIds[childIds.length - 1]);
      return last ? last.getBoundingClientRect().bottom - hostTop : 0;
    }
    const at = childEls.get(childIds[insertionIndex]);
    return at ? at.getBoundingClientRect().top - hostTop : 0;
  }
</script>
<div bind:this={host} class="relative">
  <NodeBase
    id={id}
    droppable
    class={`rounded border border-neutral-200 p-2 ${over ? 'ring-1 ring-blue-300 bg-blue-50/30' : ''} ${className ?? ''}`}
    ondragenter={handleEnter}
    ondragleave={handleLeave}
    ondrop={handleDrop}
  >
    {#snippet children()}
      {#if header}{@render header()}{/if}
      {#if childIds.length === 0}
        {#if empty}{@render empty()}{/if}
      {/if}
      <div class={layout === 'free' ? 'relative' : 'relative space-y-2'}>
        {#each childIds as cid (cid)}
          <div use:collect={cid}>
            {#if item}
              {@render item({ id: cid })}
            {:else}
              <div class="text-xs text-neutral-600 p-2 rounded border">{cid}</div>
            {/if}
          </div>
        {/each}
        {#if over && layout === 'vertical' && insertionIndex != null}
          <div
            class="absolute left-1 right-1 h-0.5 bg-blue-500 pointer-events-none"
            style={`top:${barTopPx()}px`}
          ></div>
        {/if}
      </div>
    {/snippet}
  </NodeBase>
</div>
