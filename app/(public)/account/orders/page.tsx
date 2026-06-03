import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { formatCurrency } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Order History | Brooks Fabrics",
};

export default async function OrdersPage() {
  const session = await getServerSession(customerAuthOptions);
  
  if (!session?.user?.id) return null;

  await connectDB();
  const orders = await Order.find({ customerId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  if (orders.length === 0) {
    return (
      <div className="card p-10">
        <EmptyState
          icon="cart"
          title="No orders yet"
          description="When you place orders, they will appear here."
          cta={{ href: "/shop", label: "Start Shopping" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold text-ink">Order History</h2>

      <div className="space-y-6">
        {orders.map((order: any) => (
          <div key={order._id.toString()} className="card overflow-hidden">
            <div className="bg-surface-muted px-6 py-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-ink-muted mb-0.5">Order Placed</p>
                  <p className="font-medium text-ink">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-ink-muted mb-0.5">Total</p>
                  <p className="font-medium text-ink">{formatCurrency(order.total)}</p>
                </div>
                <div>
                  <p className="text-ink-muted mb-0.5">Order Number</p>
                  <p className="font-medium text-ink">#{order.paystackReference.substring(0, 10).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
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

            <div className="p-6">
              <div className="space-y-6">
                {order.items.map((item: any) => (
                  <div key={item.productId.toString()} className="flex gap-5">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-muted shrink-0 border border-border-light">
                      <Image
                        src={item.image || "/placeholder-fabric.jpg"}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-semibold text-ink text-base sm:text-lg hover:text-primary-600 transition-colors">
                            <Link href={`/product/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}`}>
                              {item.name}
                            </Link>
                          </h4>
                          <p className="text-sm text-ink-muted mt-1">
                            {formatCurrency(item.price)} / 6 yds
                          </p>
                        </div>
                        <p className="font-bold text-ink shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-ink-secondary mt-3">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
