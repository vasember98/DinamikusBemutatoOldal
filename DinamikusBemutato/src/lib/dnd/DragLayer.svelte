<script lang="ts">
  import { drag } from '$lib/dnd/DragManager';
  import type { DragState } from '$lib/dnd/DragManager';

  let state: DragState | null = null;
  const unsub = drag.subscribe((d) => (state = d));
  export let showTarget = true;

  $: ghostStyle = state
    ? `
      position: fixed;
      left:${state.startRect.left}px;
      top:${state.startRect.top}px;
      width:${state.startRect.width}px;
      height:${state.startRect.height}px;
      transform: translate(${state.pointer.x - state.offset.x - state.startRect.left}px, ${state.pointer.y - state.offset.y - state.startRect.top}px);
      pointer-events:none;
      box-sizing:border-box;
      border:2px dashed currentColor;
      opacity:.8;
    `
    : '';

  $: targetStyle = state?.overRect
    ? `
      position: fixed;
      left:\${state.overRect.left}px;
      top:\${state.overRect.top}px;
      width:\${state.overRect.width}px;
      height:\${state.overRect.height}px;
      pointer-events:none;
      box-sizing:border-box;
      border:2px solid currentColor;
      opacity:.5;
    `
    : '';
</script>

{#if state}
  <div class="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
    <div style={ghostStyle} class="drag-ghost"></div>
    {#if showTarget && state.overRect}
      <div style={targetStyle} class="drag-target"></div>
    {/if}
  </div>

  <!-- Screen reader announcements -->
  <div class="sr-only" aria-live="polite">
    {#if !state.overId}
      Picked up {state.sourceLabel ?? state.sourceId}. Use arrow keys to move. Press Space or Enter to drop. Press Escape to cancel.
    {:else}
      Over drop zone {state.overLabel ?? state.overId}. Press Space or Enter to drop.
    {/if}
  </div>
{/if}

<style>
  :global(html.app-dragging) {
    -webkit-user-select: none;
    user-select: none;
    touch-action: none;
  }
</style>
