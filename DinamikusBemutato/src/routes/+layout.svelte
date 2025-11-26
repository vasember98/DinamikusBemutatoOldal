<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import TopNav from '$lib/components/navigation/TopNav.svelte';
  import MobileSidebar from '$lib/components/navigation/MobileSidebar.svelte';
  import DesktopSidebar from '$lib/components/navigation/DesktopSidebar.svelte';
  import { sidebarVisible, sidebarWidth, useOverlaySidebar } from '$lib/stores/ui';
  import DragLayer from '$lib/dnd/DragLayer.svelte';
  let { children } = $props<{ children: Snippet }>();
  const HEADER_H = 56;
</script>
<div class="min-h-dvh bg-white dark:bg-neutral-950">
  <header class="fixed top-0 left-0 right-0 h-[3.5rem] border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 z-30">
    <TopNav />
  </header>
  <MobileSidebar />
  <DesktopSidebar />
  <div
    class="relative"
    style="
      padding-top: 3.5rem;
    "
  >
    <main
      class="min-w-0"
      style="
        padding-left: {(!$useOverlaySidebar && $sidebarVisible) ? `${$sidebarWidth}px` : '0px'};
        transition: padding-left 200ms;
      "
    >
      {@render children?.()}
    </main>
  </div>
  <DragLayer />
</div>
