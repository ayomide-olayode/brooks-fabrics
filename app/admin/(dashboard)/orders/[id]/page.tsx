import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import OrderStatusUpdater from "./OrderStatusUpdater";

export const metadata = { title: "Order Detail" };

interface OrderItemDetail {
  name: string;
  price: number;
  quantity: number;
}

interface OrderDetail {
  _id: string;
  customerName: string;
  email: string;
  phone?: string;
  address?: string;
  paystackReference?: string;
  items: OrderItemDetail[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderStatus: string;
  createdAt: string;
}

async function getOrder(id: string): Promise<OrderDetail | null> {
  await connectDB();
  try {
    const order = await Order.findById(id).lean();
    if (!order) return null;
    const parsed: OrderDetail = JSON.parse(JSON.stringify(order));
    return parsed;
  } catch {
    return null;
  }
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage(props: OrderDetailPageProps) {
  const params = await props.params;
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Orders
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 font-medium">
          Order #{order._id.slice(-8).toUpperCase()}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>

      {/* Customer info */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Customer</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Name</p>
            <p className="font-medium text-gray-900">{order.customerName}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Email</p>
            <p className="font-medium text-gray-900">{order.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Phone</p>
            <p className="font-medium text-gray-900">{order.phone || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Payment Ref</p>
            <p className="font-medium text-gray-900 text-xs truncate">
              {order.paystackReference || "—"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-xs">Delivery Address</p>
            <p className="font-medium text-gray-900">{order.address || "—"}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Items</h2>
        <div className="divide-y divide-gray-50">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 text-sm"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.quantity} yard{item.quantity !== 1 ? "s" : ""} ×{" "}
                  {formatCurrency(item.price)}
                </p>
              </div>
              <span className="font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <hr className="border-gray-100" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Delivery</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Status update */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
        <OrderStatusUpdater
          orderId={order._id}
          currentStatus={order.orderStatus}
        />
      </div>
    </div>
  );
}
