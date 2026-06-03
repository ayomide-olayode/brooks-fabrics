"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;

// Utility to convert Base64 string to Uint8Array for push manager
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

export default function PushToggle() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check for support
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }
    setIsSupported(true);

    // 2. Check current subscription status
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((subscription) => {
        setIsSubscribed(!!subscription);
        setIsLoading(false);
      });
    });
  }, []);

  const subscribeUser = async () => {
    setIsLoading(true);
    try {
      console.log("VAPID KEY:", VAPID_PUBLIC_KEY);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission not granted for Notification");
      }

      const registration = await navigator.serviceWorker.ready;
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);

      // Send to server
      const response = await fetch("/api/customers/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) throw new Error("Failed to save subscription on server");
      
      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert("Failed to enable notifications. Please ensure you have granted permission in your browser settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeUser = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Remove from server first
        await fetch("/api/customers/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        // Unsubscribe from browser
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSupported === false) {
    return (
      <div className="card p-6 bg-yellow-50 border border-yellow-100 flex items-start gap-4">
        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
          <BellOff className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-yellow-800">Push Notifications Unavailable</h3>
          <p className="text-sm text-yellow-700 mt-1">
            To receive notifications on iOS, you must first add this app to your Home Screen. Tap the Share button in Safari and select "Add to Home Screen".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border-light hover:border-primary-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-primary-50 text-primary-600' : 'bg-surface-muted text-ink-muted'}`}>
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-ink">Push Notifications</h3>
          <p className="text-sm text-ink-secondary mt-1">
            {isSubscribed 
              ? "You are currently receiving updates on orders and new arrivals."
              : "Enable notifications to get updates on your orders and special offers."}
          </p>
        </div>
      </div>
      
      <button
        onClick={isSubscribed ? unsubscribeUser : subscribeUser}
        disabled={isLoading}
        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 min-w-[120px] ${
          isSubscribed 
            ? "bg-surface text-ink border border-border hover:bg-surface-muted" 
            : "bg-ink text-white hover:bg-ink-light"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSubscribed ? "Disable" : "Enable"}
      </button>
    </div>
  );
}
