/// <reference lib="webworker" />

// We cast self to any to avoid TypeScript DOM lib conflicts in Next.js
const sw = self as any;

// To disable all workbox logging during development
sw.__WB_DISABLE_DEV_LOGS = true;

sw.addEventListener("push", (event: any) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Brooks Fabrics";
  const message = data.message || "You have a new notification.";
  const icon = data.icon || "/android-chrome-192x192.png";
  const badge = data.badge || "/android-chrome-192x192.png";
  const url = data.url || "/";

  event.waitUntil(
    sw.registration.showNotification(title, {
      body: message,
      icon,
      badge,
      data: { url },
    })
  );
});

sw.addEventListener("notificationclick", (event: any) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  
  event.waitUntil(
    sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList: any[]) => {
      // Check if there's already a tab open with this URL
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // If no tab is open, open a new one
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(url);
      }
    })
  );
});
