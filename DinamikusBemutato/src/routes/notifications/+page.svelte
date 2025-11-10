<script lang="ts">
  import NotificationShell from '$lib/components/notifications/NotificationsShell.svelte';
  import NotificationFilters from '$lib/components/notifications/NotificationFilter.svelte';
  import NotificationItem from '$lib/components/notifications/NotificationItem.svelte';

  type NotificationType = 'system' | 'comment' | 'mention' | 'warning';

  interface Notification {
    id: string;
    title: string;
    body: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string; // ISO
  }

  type Filter = 'all' | 'unread' | 'system' | 'mentions';

  // Mock data – hook this up to your backend later
  let notifications: Notification[] = [
    {
      id: '1',
      title: 'Welcome aboard 🎉',
      body: 'Your account was created successfully.',
      type: 'system',
      isRead: false,
      createdAt: '2025-11-09T10:15:00Z'
    },
    {
      id: '2',
      title: 'New comment on your post',
      body: '"Svelte auth is now working, thanks!"',
      type: 'comment',
      isRead: false,
      createdAt: '2025-11-09T12:30:00Z'
    },
    {
      id: '3',
      title: '@you mentioned in #general',
      body: '"Can you review the latest build?"',
      type: 'mention',
      isRead: true,
      createdAt: '2025-11-08T18:02:00Z'
    },
    {
      id: '4',
      title: 'Database backup completed',
      body: 'Nightly backup finished without issues.',
      type: 'system',
      isRead: true,
      createdAt: '2025-11-08T01:00:00Z'
    }
  ];

  let activeFilter: Filter = 'all';

  // derived values
  $: filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'system') return n.type === 'system';
    if (activeFilter === 'mentions') return n.type === 'mention';
    return true;
  });

  $: unreadCount = notifications.filter((n) => !n.isRead).length;

  function setFilter(filter: Filter) {
    activeFilter = filter;
  }

  function markAllAsRead() {
    notifications = notifications.map((n) => ({ ...n, isRead: true }));
  }

  function clearAllRead() {
    notifications = notifications.filter((n) => !n.isRead);
  }

  function toggleRead(id: string) {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: !n.isRead } : n
    );
  }
</script>

<NotificationShell
  title="Notifications"
  subtitle="Stay on top of what’s happening in your project."
  {unreadCount}
  onMarkAllAsRead={markAllAsRead}
  onClearAllRead={clearAllRead}
>
  <NotificationFilters
    {activeFilter}
    {unreadCount}
    onChangeFilter={setFilter}
  />

  {#if filteredNotifications.length === 0}
    <div class="mt-10 flex flex-col items-center text-sm text-slate-500">
      <div class="mb-2 text-lg">No notifications here</div>
      <p>Once something happens, it’ll show up in this list.</p>
    </div>
  {:else}
    <ul class="mt-4 space-y-2">
      {#each filteredNotifications as notification (notification.id)}
        <NotificationItem
          {notification}
          onToggleRead={toggleRead}
        />
      {/each}
    </ul>
  {/if}
</NotificationShell>

<style>
  :global(body) {
    background-color: #020817;
  }
</style>
