<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import TopNav from '$lib/components/navigation/TopNav.svelte';
  import MobileSidebar from '$lib/components/navigation/MobileSidebar.svelte';
  import DesktopSidebar from '$lib/components/navigation/DesktopSidebar.svelte';
  import { sidebarVisible, sidebarWidth, useOverlaySidebar } from '$lib/stores/ui';
  let { children } = $props<{ children: Snippet }>();
  const HEADER_H = 56; // keep in sync with TopNav row height
</script>

<div class="min-h-dvh grid grid-rows-[3.5rem_1fr] bg-white dark:bg-neutral-950">
  <!-- Row 1 -->
  <header class="relative h-[3.5rem] border-b border-neutral-200 dark:border-neutral-800">
    <TopNav />
  </header>

  <!-- Sidebars -->
  <MobileSidebar />
  <DesktopSidebar />

  <!-- Row 2 content. On desktop, shift right by sidebar width when visible -->
  <div
    class="relative"
    style="
      padding-top: 0;
    "
  >
    <main
      class="min-w-0"
      style="
        /* push content when desktop sidebar is visible */
        padding-left: {(!$useOverlaySidebar && $sidebarVisible) ? `${$sidebarWidth}px` : '0px'};
        transition: padding-left 200ms;
      "
    >
      {@render children?.()}
    </main>
  </div>
</div>
