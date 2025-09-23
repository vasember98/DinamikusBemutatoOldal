<script lang="ts">
  import { page } from '$app/state';
  import { Menu, House, Bell, User as UserIcon } from 'lucide-svelte';
  import { sidebarVisible, toggleSidebar } from '$lib/stores/ui';

  $: user = page.data.user; // comes from +layout.server.ts
</script>

<nav class="sticky top-0 z-50 h-14 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
  <div class="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
    <!-- left -->
    <div class="flex items-center gap-2">
      <button
  class="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-50 focus:outline-none focus:ring"
  aria-label="Toggle menu"
  aria-controls="app-sidebar"
  aria-expanded={$sidebarVisible}
  on:click={toggleSidebar}
>
        <Menu size={20} />
      </button>

      <a href="/" aria-label="Home"
         class="inline-flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-gray-50">
        <House size={20} />
      </a>
    </div>

    <!-- right -->
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
        <a href="/account"
           class="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          {user.username}
        </a>
      {:else}
        <a href="/demo/lucia/login"
           class="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          Log in
        </a>
      {/if}
    </div>
  </div>
</nav>
