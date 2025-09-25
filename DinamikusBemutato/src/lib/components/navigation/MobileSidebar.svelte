<script lang="ts">
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';
  import { sidebarVisible, useOverlaySidebar, prefersReducedMotion, closeSidebar } from '$lib/stores/ui';
  import { onMount } from 'svelte';

  let dialogEl: HTMLDivElement | null = null;

  // Focus management + Esc support
  onMount(() => {
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' ? closeSidebar() : null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // When opening, move focus into the dialog for a11y
  $: if ($useOverlaySidebar && $sidebarVisible && dialogEl) {
    // microtask to ensure it's rendered
    queueMicrotask(() => dialogEl?.focus());
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeSidebar();
  }
</script>

{#if $useOverlaySidebar}
  <!-- Backdrop as keyboard-accessible button -->
  <button
    type="button"
    class="fixed inset-0 z-40 md:hidden bg-black/40 transition-opacity"
    style="opacity: {$sidebarVisible ? 1 : 0};
           pointer-events: {$sidebarVisible ? 'auto' : 'none'};
           transition-duration: {$prefersReducedMotion ? 0 : 200}ms;"
    aria-label="Close menu"
    aria-hidden={!$sidebarVisible}
    on:click={closeSidebar}
  ></button>

  <!-- Dialog container: focusable + keyboard handler -->
  <div
    id="app-sidebar"
    role="dialog"
    aria-modal="true"
    aria-label="Main navigation"
    tabindex="-1"
    bind:this={dialogEl}
    on:keydown={handleKeydown}
    class="fixed inset-y-0 left-0 z-50 md:hidden w-[min(22rem,90vw)]
           bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-xl"
    style="transform: translateX({$sidebarVisible ? '0%' : '-100%'});
           transition: transform {$prefersReducedMotion ? 0 : 200}ms;"
    on:click|stopPropagation
  >
    <Sidebar />
  </div>
{/if}
