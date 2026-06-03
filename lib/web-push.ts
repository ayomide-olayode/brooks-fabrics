import webpush from "web-push";
import { logger } from "./logger";
import Customer from "@/lib/db/models/Customer";

// Initialize web-push with VAPID keys from environment variables
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateKey = process.env.VAPID_PRIVATE_KEY || "";

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:hello@brooksfabrics.com",
    publicKey,
    privateKey
  );
} else {
  logger.warn("VAPID keys not configured. Web push notifications will not work.");
}

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Sends a push notification to all stored subscriptions of a specific customer
 */
export async function sendPushToCustomer(customerId: string, payload: PushPayload) {
  if (!publicKey || !privateKey) return;

  try {
    const customer = await Customer.findById(customerId).select("pushSubscriptions").lean();
    
    if (!customer || !customer.pushSubscriptions || customer.pushSubscriptions.length === 0) {
      return; // No active subscriptions for this user
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/account/orders",
      icon: payload.icon || "/icon-192x192.png",
    });

    // Send push to all registered devices for this user
    const sendPromises = customer.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payloadString
        );
      } catch (err: any) {
        // If the subscription is gone (user revoked permission), we should remove it from the DB
        if (err.statusCode === 404 || err.statusCode === 410) {
          logger.info(`Push subscription expired/unsubscribed for ${customerId}, removing...`);
          await Customer.updateOne(
            { _id: customerId },
            { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } }
          );
        } else {
          logger.error(`Failed to send push to one of the devices of ${customerId}`, { error: err });
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    logger.error("Failed to process sendPushToCustomer", { error });
  }
}
