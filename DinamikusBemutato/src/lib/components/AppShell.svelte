<script lang="ts">
  import type { Snippet } from 'svelte';
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';
  import { menuNodes } from '$lib/stores/menus';
  export let children: Snippet;
</script>

<div class="min-h-screen flex">
  <Sidebar nodes={$menuNodes} />
  <main class="flex-1 p-6">
    {@render children?.()}
  </main>
</div>
