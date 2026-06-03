import connectDB from "@/lib/db/mongoose";
import Order from "@/lib/db/models/Order";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import OrderStatusFilter from "./OrderStatusFilter";
import OrderSearchInput from "./OrderSearchInput";

export const metadata = { title: "Orders" };

interface OrderItemSummary {
  name: string;
  price: number;
  quantity: number;
}

interface OrderListItem {
  _id: string;
  paystackReference?: string;
  customerName: string;
  email: string;
  items: OrderItemSummary[];
  total: number;
  orderStatus: keyof typeof STATUS_COLORS;
  createdAt: string;
}

async function getOrders(status: string, search: string): Promise<OrderListItem[]> {
  await connectDB();
  const query: any = {};
  if (status) query.orderStatus = status;
  
  if (search) {
    const searchRegex = new RegExp(search, "i");
    query.$or = [
      { customerName: searchRegex },
      { paystackReference: searchRegex },
    ];
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  const parsed: OrderListItem[] = JSON.parse(JSON.stringify(orders));
  return parsed;
}

const STATUS_COLORS = {
  new: "badge-green",
  processing: "badge-yellow",
  delivered: "bg-blue-100 text-blue-700 badge",
  cancelled: "badge-red",
} as const;

interface AdminOrdersPageProps {
  searchParams?: Promise<{ status?: string; search?: string }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const resolvedParams = await searchParams;
  const status = resolvedParams?.status || "";
  const search = resolvedParams?.search || "";
  const orders = await getOrders(status, search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} orders</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <OrderSearchInput />
          <OrderStatusFilter selected={status} />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-gray-400 text-lg mb-1">No orders yet.</p>
          <p className="text-gray-400 text-sm">
            {status
              ? `No orders with status "${status}".`
              : "Orders will appear here once customers check out."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Order #</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-sm text-gray-600">
                      {order.paystackReference ? `#${order.paystackReference.substring(0, 8).toUpperCase()}` : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3 font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={STATUS_COLORS[order.orderStatus] || "badge"}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-primary-600 hover:underline text-xs font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
