<script lang="ts">
  import { draggable as useDraggable } from '$lib/dnd/actions/draggable';
  import { droppable as useDroppable } from '$lib/dnd/actions/droppable';
  import { drag } from '$lib/dnd/DragManager';
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    id: string;
    label?: string;
    draggable?: boolean;
    droppable?: boolean;
    class?: string;
    children?: Snippet;
    holdMs?: number;
    slop?: number;

    // component “events” as props (Svelte 5 style)
    onedit?: (e: CustomEvent<{ id: string }>) => void;
    ondragenter?: (e: CustomEvent<any>) => void;
    ondragleave?: (e: CustomEvent<any>) => void;
    ondrop?: (e: CustomEvent<any>) => void;
  };

  let {
    id, label = undefined, draggable = true, droppable = false, class: className = '',
    children, holdMs = 220, slop = 6,
    onedit, ondragenter, ondragleave, ondrop
  }: Props = $props();

  let host = $state<HTMLElement | null>(null);

  // reflect “am I dragging myself?”
  let isDraggingSelf = $state(false);
  const unDrag = drag.subscribe((v) => { isDraggingSelf = !!v && v.sourceId === id; });
  onDestroy(unDrag);

  function emitEdit() {
    const evt = new CustomEvent('edit', { bubbles: true, detail: { id } });
    host?.dispatchEvent(evt);   // still bubble for internal listeners
    onedit?.(evt);              // and call the component prop
  }

  // ---- NEW: forward DOM CustomEvents to component props (no DOM attributes) ----
  let unEnter = () => {}, unLeave = () => {}, unDrop = () => {};
  $effect(() => {
    // clean previous
    unEnter(); unLeave(); unDrop();
    if (!host) return;

    if (ondragenter) {
      const h = (e: Event) => ondragenter?.(e as CustomEvent<any>);
      host.addEventListener('dragenter', h as EventListener);
      unEnter = () => host?.removeEventListener('dragenter', h as EventListener);
    } else unEnter = () => {};

    if (ondragleave) {
      const h = (e: Event) => ondragleave?.(e as CustomEvent<any>);
      host.addEventListener('dragleave', h as EventListener);
      unLeave = () => host?.removeEventListener('dragleave', h as EventListener);
    } else unLeave = () => {};

    if (ondrop) {
      const h = (e: Event) => ondrop?.(e as CustomEvent<any>);
      host.addEventListener('drop', h as EventListener);
      unDrop = () => host?.removeEventListener('drop', h as EventListener);
    } else unDrop = () => {};
  });

  onDestroy(() => { unEnter(); unLeave(); unDrop(); });

  const base =
    'node-base relative rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 shadow-sm select-none';
</script>

{#if droppable}
  <section bind:this={host} class={`${base} ${className}`} role="group" aria-label={label} use:useDroppable={{ id, label }}>
    {#if draggable}
      <button
        type="button"
        class="node-drag-surface absolute inset-0 z-[5] rounded-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400"
        aria-label="Edit node (hold to drag). Press Space or Enter to drop."
        aria-pressed={isDraggingSelf}
        title="Edit node (hold to drag)"
        onclick={emitEdit}
        use:useDraggable={{ id, activate: 'hold', holdMs, slop }}
      ></button>
    {/if}
    <div class="relative z-[1] p-3">
      {@render children?.()}
    </div>
  </section>
{:else}
  <section bind:this={host} class={`${base} ${className}`} role="group" aria-label={label}>
    {#if draggable}
      <button
        type="button"
        class="node-drag-surface absolute inset-0 z-[5] rounded-2xl bg-transparent focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400"
        aria-label="Edit node (hold to drag). Press Space or Enter to drop."
        aria-pressed={isDraggingSelf}
        title="Edit node (hold to drag)"
        onclick={emitEdit}
        use:useDraggable={{ id, activate: 'hold', holdMs, slop }}
      ></button>
    {/if}
    <div class="relative z-[1] p-3">
      {@render children?.()}
    </div>
  </section>
{/if}

<style>
  .node-base { transition: box-shadow .12s ease, transform .12s ease; will-change: transform; }
  .node-base:focus-visible { outline: 2px solid var(--tw-ring-color, #3b82f6); outline-offset: 2px; }
</style>
