import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import Order from "@/lib/db/models/Order";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Package, MapPin } from "lucide-react";

export default async function AccountOverviewPage() {
  const session = await getServerSession(customerAuthOptions);
  
  if (!session?.user?.id) return null;

  await connectDB();
  const [customer, recentOrders] = await Promise.all([
    Customer.findById(session.user.id).lean(),
    Order.find({ customerId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
  ]);

  if (!customer) return null;

  const orderCount = await Order.countDocuments({ customerId: session.user.id });

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="card p-8 bg-primary-900 text-white border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="font-heading text-2xl font-bold text-gold-400 mb-2">
            Welcome back, {session.user.name?.split(" ")[0] || "Customer"}!
          </h2>
          <p className="text-primary-100">
            Manage your orders, addresses, and account settings from your dashboard.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/account/orders" className="card p-6 flex items-center gap-5 hover:border-primary-500 transition-colors group">
          <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center group-hover:bg-primary-50 transition-colors">
            <Package className="w-6 h-6 text-ink-secondary group-hover:text-primary-600 transition-colors" />
          </div>
          <div>
            <p className="text-ink-muted text-sm font-medium">Total Orders</p>
            <p className="text-ink font-heading text-2xl font-bold">{orderCount}</p>
          </div>
        </Link>

        <Link href="/account/addresses" className="card p-6 flex items-center gap-5 hover:border-primary-500 transition-colors group">
          <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center group-hover:bg-primary-50 transition-colors">
            <MapPin className="w-6 h-6 text-ink-secondary group-hover:text-primary-600 transition-colors" />
          </div>
          <div>
            <p className="text-ink-muted text-sm font-medium">Saved Addresses</p>
            <p className="text-ink font-heading text-2xl font-bold">{(customer as any).addresses?.length || 0}</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-xl font-bold text-ink">Recent Orders</h3>
          {recentOrders.length > 0 && (
            <Link href="/account/orders" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-6 h-6 text-ink-muted" />
            </div>
            <p className="text-ink font-medium">No orders yet</p>
            <p className="text-ink-muted text-sm mt-1 mb-6">You haven&apos;t placed any orders.</p>
            <Link href="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any) => (
              <div key={order._id.toString()} className="border border-border-light rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-muted transition-colors">
                <div>
                  <p className="font-medium text-ink">Order #{order.paystackReference.substring(0, 8)}...</p>
                  <p className="text-sm text-ink-muted mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
                  <p className="font-bold text-ink">{formatCurrency(order.total)}</p>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                    order.orderStatus === "processing" ? "bg-blue-100 text-blue-700" :
                    order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
