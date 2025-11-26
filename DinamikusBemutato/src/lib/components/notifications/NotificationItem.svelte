<script lang="ts">
  type NotificationType = 'system' | 'comment' | 'mention' | 'warning';
  interface Notification {
    id: string;
    title: string;
    body: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
  }
  export let notification: Notification;
  export let onToggleRead: (id: string) => void;
  function handleToggle() {
    onToggleRead && onToggleRead(notification.id);
  }
  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short'
    });
  }
  function typeLabel(type: NotificationType): string {
    if (type === 'system') return 'System';
    if (type === 'comment') return 'Comment';
    if (type === 'mention') return 'Mention';
    if (type === 'warning') return 'Warning';
    return 'Update';
  }
</script>
<li
  class={`group flex items-start gap-3 rounded-xl border px-3 py-3 text-xs transition ${
    notification.isRead
      ? 'border-slate-800 bg-slate-950/40 text-slate-400'
      : 'border-emerald-500/40 bg-emerald-500/5 text-slate-100 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
  }`}
>
  <div
    class={`mt-1 h-2 w-2 rounded-full ${
      notification.isRead ? 'bg-slate-600' : 'bg-emerald-400'
    }`}
  ></div>
  <div class="flex-1 space-y-1">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h2 class="text-[11px] font-semibold">
          {notification.title}
        </h2>
        <span
          class={`rounded-full px-1.5 py-0.5 text-[8px] uppercase tracking-wide ${
            notification.type === 'system'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40'
              : notification.type === 'mention'
              ? 'bg-violet-500/15 text-violet-300 border border-violet-500/40'
              : notification.type === 'warning'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
              : 'bg-slate-500/10 text-slate-300 border border-slate-600/40'
          }`}
        >
          {typeLabel(notification.type)}
        </span>
      </div>
      <span class="text-[9px] text-slate-500">
        {formatTime(notification.createdAt)}
      </span>
    </div>
    <p class="text-[10px] leading-snug text-slate-300">
      {notification.body}
    </p>
    <button
      type="button"
      class="mt-1 text-[9px] text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
      on:click={handleToggle}
    >
      {notification.isRead ? 'Mark as unread' : 'Mark as read'}
    </button>
  </div>
</li>
