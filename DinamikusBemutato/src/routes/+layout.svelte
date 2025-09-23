<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopNav from '$lib/components/TopNav.svelte';
  export let children: Snippet;
  const editorsHref = '/editors'; // optional clickable header for the dynamic section
  function openSidebar() {
    // fire your drawer logic here if you have one
    const ev = new CustomEvent('open-sidebar');
    window.dispatchEvent(ev);
  }
</script>

<div class="min-h-screen bg-white dark:bg-neutral-950" style="--nav-h: 56px;">
  <!-- header -->
  <TopNav />

  <!-- content area under the header -->
  <div class="mx-auto grid max-w-screen-xl grid-cols-[18rem,1fr] gap-0 px-0 lg:px-0">
    <Sidebar />
    <main class="min-w-0">
      {@render children?.()}
    </main>
  </div>
</div>