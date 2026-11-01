/* global self, clients */
self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Trademarx notification', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Trademarx notification';
  const options = {
    body: payload.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: payload.tag || 'trademarx-notification',
    renotify: payload.severity === 'URGENT',
    data: { actionUrl: payload.actionUrl || '/agent-portal/notifications' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const actionUrl = event.notification.data?.actionUrl || '/agent-portal/notifications';
  const destination = new URL(actionUrl, self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin)) {
        await client.navigate(destination);
        await client.focus();
        return;
      }
    }
    await clients.openWindow(destination);
  })());
});
