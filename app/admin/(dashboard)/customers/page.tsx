import { Metadata } from "next";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import { Users, Mail, ShoppingBag, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Customers | Admin Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await connectDB();

  // Use aggregation to efficiently get users and their order counts
  const customers = await Customer.aggregate([
    {
      $lookup: {
        from: "orders", // Standard Mongoose collection name for 'Order' model
        localField: "_id",
        foreignField: "customerId",
        as: "orders",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        createdAt: 1,
        orderCount: { $size: "$orders" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">
            Registered Customers
          </h1>
          <p className="text-ink-muted mt-1 text-sm">
            View all registered users and their order history.
          </p>
        </div>
        <div className="card px-4 py-2 flex items-center gap-3">
          <div className="p-2 bg-primary-50 text-primary-600 rounded-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-ink-muted font-medium">Total Customers</p>
            <p className="text-xl font-bold text-ink">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border-light">
              <Users className="w-6 h-6 text-ink-secondary" />
            </div>
            <p className="text-ink font-medium">No customers found</p>
            <p className="text-sm text-ink-muted mt-1">
              When users register, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-muted text-ink-muted border-b border-border-light">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Email Address</th>
                  <th className="px-6 py-4 font-medium">Registered Date</th>
                  <th className="px-6 py-4 font-medium">Total Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {customers.map((cust) => (
                  <tr
                    key={cust._id.toString()}
                    className="hover:bg-surface-muted transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 font-bold shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-ink">
                          {cust.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-ink-muted">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        {cust.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-ink-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {new Date(cust.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag
                          className={`w-4 h-4 shrink-0 ${
                            cust.orderCount > 0
                              ? "text-gold-500"
                              : "text-ink-secondary"
                          }`}
                        />
                        <span
                          className={`font-bold ${
                            cust.orderCount > 0 ? "text-ink" : "text-ink-secondary"
                          }`}
                        >
                          {cust.orderCount}
                        </span>
                      </div>
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
