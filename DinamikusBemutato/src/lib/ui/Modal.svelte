<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  export let title = '';
  const dispatch = createEventDispatcher<{ close: void }>();
  let dialogEl: HTMLDivElement;

  function close() { dispatch('close'); }

  function onBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  // rudimentary focus trap start
  onMount(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogEl?.focus({ preventScroll: true });
    return () => prev?.focus();
  });
</script>

<div
  class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
  role="dialog"
  aria-modal="true"
  on:click={onBackdrop}
>
  <div
    class="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl"
    tabindex="-1"
    bind:this={dialogEl}
  >
    <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
      <h2 class="font-semibold">{title}</h2>
      <button class="text-sm px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800" on:click={close} aria-label="Close">✕</button>
    </div>
    <div class="p-4">
      <slot />
    </div>
  </div>
</div>
