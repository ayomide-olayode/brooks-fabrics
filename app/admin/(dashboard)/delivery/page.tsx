import connectDB from "@/lib/db/mongoose";
import DeliveryLocation from "@/lib/db/models/DeliveryLocation";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import DeleteDeliveryButton from "./DeleteDeliveryButton";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Manage Delivery Locations" };

export default async function AdminDeliveryPage() {
  await connectDB();
  const locations = await DeliveryLocation.find().sort({ name: 1 }).lean();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Locations</h1>
          <p className="text-gray-500 text-sm mt-1">Manage delivery pricing by zone.</p>
        </div>
        <Link href="/admin/delivery/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Location
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Location Name</th>
                <th className="px-6 py-4">Delivery Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locations.map((loc: any) => (
                <tr key={loc._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{loc.name}</td>
                  <td className="px-6 py-4">{formatCurrency(loc.fee)}</td>
                  <td className="px-6 py-4">
                    {loc.isActive ? (
                      <span className="badge-green">Active</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-700">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/delivery/${loc._id}/edit`}
                      className="text-primary-600 hover:text-primary-800 transition-colors"
                      title="Edit Location"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <DeleteDeliveryButton locationId={loc._id.toString()} />
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No delivery locations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
