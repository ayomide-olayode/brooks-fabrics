import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import Link from "next/link";
import { Package, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const STATUS_COLORS = {
  new: "badge-green",
  processing: "badge-yellow",
  delivered: "bg-blue-100 text-blue-700 badge",
  cancelled: "badge-red",
} as const;

type OrderStatus = keyof typeof STATUS_COLORS;

interface RecentOrder {
  _id: string;
  customerName: string;
  email: string;
  total: number;
  orderStatus: OrderStatus;
  createdAt: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  lowStock: number;
  recentOrders: RecentOrder[];
  totalRevenue: number;
}

async function getStats(): Promise<DashboardStats> {
  await connectDB();
  const [totalProducts, totalOrders, lowStock, recentOrders, revenue] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0, $lt: 10 } }),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

  const parsedRecent: RecentOrder[] = JSON.parse(JSON.stringify(recentOrders));

  return {
    totalProducts,
    totalOrders,
    lowStock,
    recentOrders: parsedRecent,
    totalRevenue: revenue[0]?.total || 0,
  };
}

export default async function DashboardPage() {
  const { totalProducts, totalOrders, lowStock, recentOrders, totalRevenue } =
    await getStats();

  const stats: Array<{
    label: string;
    value: number | string;
    icon: typeof Package;
    color: string;
    bg: string;
    href: string;
  }> = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-primary-600",
      bg: "bg-primary-50",
      href: "/admin/products",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/orders",
    },
    {
      label: "Low Stock Alerts",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-gold-600",
      bg: "bg-gold-50",
      href: "/admin/products",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back to Brooks Fabrics admin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
          >
            <div className={`${bg} p-3 rounded-xl`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products/new"
          className="card p-5 border-2 border-dashed border-primary-200 hover:border-primary-400 transition-colors text-center"
        >
          <Package className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Add New Product</p>
          <p className="text-sm text-gray-400 mt-0.5">
            Upload a new fabric to the store
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="card p-5 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors text-center"
        >
          <ShoppingBag className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">Manage Orders</p>
          <p className="text-sm text-gray-400 mt-0.5">
            View and update order statuses
          </p>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No orders received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {order.customerName}
                      <span className="block text-xs text-gray-400 font-normal">
                        {order.email}
                      </span>
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
                    <td className="px-5 py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
