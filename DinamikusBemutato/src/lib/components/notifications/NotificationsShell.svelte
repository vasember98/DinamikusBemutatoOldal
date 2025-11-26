<script lang="ts">
  export let title = 'Notifications';
  export let subtitle = '';
  export let unreadCount = 0;
  export let onMarkAllAsRead: () => void;
  export let onClearAllRead: () => void;
</script>
<section class="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl backdrop-blur">
  <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-xl font-semibold text-slate-50 flex items-center gap-2">
        {title}
        {#if unreadCount > 0}
          <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 border border-emerald-500/40">
            {unreadCount} unread
          </span>
        {/if}
      </h1>
      {#if subtitle}
        <p class="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      {/if}
    </div>
    <div class="flex items-center gap-2 text-xs">
      <button
        type="button"
        class="rounded-full border border-slate-700 px-3 py-1 text-slate-300 hover:bg-slate-800/80 transition"
        on:click={onMarkAllAsRead}
      >
        Mark all as read
      </button>
      <button
        type="button"
        class="rounded-full border border-rose-600/70 px-3 py-1 text-rose-300 hover:bg-rose-600/10 transition"
        on:click={onClearAllRead}
      >
        Clear read
      </button>
    </div>
  </header>
  <div class="border-t border-slate-800/80 pt-4">
    <slot />
  </div>
</section>
