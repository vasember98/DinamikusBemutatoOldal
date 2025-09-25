<script lang="ts">
  import { page } from '$app/state';
  import { Menu, House, Bell, User as UserIcon } from 'lucide-svelte';
  import { sidebarVisible, toggleSidebar } from '$lib/stores/ui';
   let user = $derived(page.data.user);
</script>

<!-- Force in-flow layout -->
<nav class="static h-full w-full bg-white dark:bg-neutral-950">
  <div class="mx-auto h-full max-w-screen-xl flex items-center justify-between px-4">
    <div class="flex items-center gap-2">
      <button
  aria-label="Toggle menu"
  aria-controls="app-sidebar"
  aria-expanded={$sidebarVisible}
  onclick={() => sidebarVisible.update(v => !v)}
  class="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring"
>
  <Menu size={20} />
</button>

      <a href="/" aria-label="Home"
         class="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-50">
        <House size={20} />
      </a>
    </div>

    <div class="flex items-center gap-3">
      <a href="/notifications" aria-label="Notifications"
         class="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-50">
        <Bell size={20} />
      </a>

      <a href="/profile" aria-label="Profile"
         class="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-gray-50">
        <UserIcon size={20} />
      </a>

      {#if user}
        <a href="/account" class="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          {user.username}
        </a>
      {:else}
        <a href="/demo/lucia/login" class="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          Log in
        </a>
      {/if}
    </div>
  </div>
</nav>
