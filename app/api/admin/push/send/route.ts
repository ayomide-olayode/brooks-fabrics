import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import webpush from "web-push";
import { logAdminAction } from "@/lib/logger/audit";
import { redis } from "@/lib/redis";

// Configure web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:support@brooksfabrics.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Rate Limiting: 10 broadcasts per hour
    const rateLimitKey = `rate-limit:broadcast`;
    const count = await redis.incr(rateLimitKey);
    if (count === 1) {
      await redis.expire(rateLimitKey, 3600);
    }
    if (count > 10) {
      return NextResponse.json(
        { error: "Broadcast rate limit exceeded. Maximum 10 per hour allowed." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    await connectDB();

    // In a real large-scale app, this loop should be handled by a queue/background worker (e.g. Inngest / Vercel Cron)
    // to avoid hitting the 10-second serverless execution limit for thousands of users.
    const customers = await Customer.find({ "pushSubscriptions.0": { $exists: true } });
    
    let successCount = 0;
    let failCount = 0;
    let deadRemoved = 0;

    const payload = JSON.stringify({
      title,
      message,
      url: url || "/",
    });

    for (const customer of customers) {
      for (const subscription of customer.pushSubscriptions) {
        try {
          await webpush.sendNotification(subscription, payload);
          successCount++;
        } catch (err: any) {
          failCount++;
          // 410 Gone or 404 Not Found means the subscription is no longer valid
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Customer.updateOne(
              { _id: customer._id },
              { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
            );
            deadRemoved++;
          } else {
            console.error("Push sending error for subscription:", subscription.endpoint, err);
          }
        }
      }
    }

    // Log the broadcast action
    await logAdminAction({
      adminEmail: authResult.session.user.email || "admin",
      action: "UPDATE",
      resource: "Customer",
      resourceId: "broadcast",
      details: { title, message, successCount, failCount, deadRemoved },
    });

    return NextResponse.json({
      success: true,
      stats: { successCount, failCount, deadRemoved },
    });
  } catch (error) {
    console.error("Push broadcast error:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
