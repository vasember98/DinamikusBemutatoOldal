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
<div class="min-h-dvh grid grid-rows-[3.5rem_1fr] bg-white dark:bg-neutral-950">
  <header class="relative h-[3.5rem] border-b border-neutral-200 dark:border-neutral-800">
    <TopNav />
  </header>
  <MobileSidebar />
  <DesktopSidebar />
  <div
    class="relative"
    style="
      padding-top: 0;
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
