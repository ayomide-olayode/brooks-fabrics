import PushBroadcastUI from "./PushBroadcastUI";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";

export const metadata = { title: "Push Broadcasts" };

export default async function PushBroadcastPage() {
  await connectDB();
  const subscriberCount = await Customer.countDocuments({ "pushSubscriptions.0": { $exists: true } });
  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Push Broadcasts</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Send a push notification to all subscribed customers.
        </p>
      </div>

      <div className="card p-6 border-blue-200 bg-blue-50/50 mb-6">
        <h3 className="font-semibold text-blue-900 mb-1">Before you broadcast</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          This feature sends a native push notification to every customer who has enabled notifications.
          Please use this sparingly for important updates, flash sales, or critical store announcements to avoid spamming users.
        </p>
      </div>

      <PushBroadcastUI subscriberCount={subscriberCount} />
    </div>
  );
}
