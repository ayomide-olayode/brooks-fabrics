"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Convert a base64 string to a Uint8Array (required for web push keys)
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const { status } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      if (Notification.permission === "granted") {
        setHasPermission(true);
      }
    }
  }, []);

  useEffect(() => {
    // Only attempt to subscribe if they are logged in, push is supported, and they granted permission
    // AND they have just signed in. For production, you might want to call this on explicit user action
    // rather than automatically, but since it requires a prompt anyway, doing it if permission is already granted is fine.
    const subscribeToPush = async () => {
      if (status !== "authenticated" || !isSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!publicVapidKey) return;

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        }

        // Send the subscription to our backend
        await fetch("/api/web-push/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subscription),
        });

      } catch (err) {
        console.error("Failed to subscribe to push notifications", err);
      }
    };

    if (hasPermission && status === "authenticated") {
      subscribeToPush();
    }
  }, [hasPermission, isSupported, status]);

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Error requesting notification permission", err);
    }
  };

  // If push isn't supported, or user is not logged in, or already has permission, don't show the prompt
  if (!isSupported || status !== "authenticated" || hasPermission) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-72 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="bg-primary-50 p-2 rounded-full text-primary-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">Enable Order Updates</h4>
          <p className="text-xs text-gray-500 mt-0.5">Get notified when your order ships or arrives.</p>
        </div>
      </div>
      <div className="flex gap-2 w-full mt-1">
        <button onClick={() => setHasPermission(true)} className="flex-1 py-1.5 px-3 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">Later</button>
        <button onClick={handleSubscribe} className="flex-1 py-1.5 px-3 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors">Enable</button>
      </div>
    </div>
  );
}
