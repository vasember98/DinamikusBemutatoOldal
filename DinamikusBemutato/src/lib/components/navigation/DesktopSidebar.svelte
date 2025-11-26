<script lang="ts">
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';
  import { sidebarVisible, sidebarWidth } from '$lib/stores/ui';
  const HEADER_H = 56;
</script>
<aside
  class="hidden md:block fixed inset-y-0 left-0 z-20 bg-white dark:bg-neutral-950
         border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto"
  style="
    top: {HEADER_H}px;
    width: {$sidebarWidth}px;
    transform: translateX({$sidebarVisible ? '0%' : '-100%'});
    transition: transform 200ms;
  "
  aria-label="Main navigation"
>
  <Sidebar />
</aside>
