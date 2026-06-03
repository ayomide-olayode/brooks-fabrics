import connectDB from "@/lib/db/mongoose";
import Service from "@/lib/db/models/Service";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";
import DeleteServiceButton from "./DeleteServiceButton";

export const metadata = { title: "Manage Services" };

export default async function AdminServicesPage() {
  await connectDB();
  const services = await Service.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <p className="text-gray-500 text-sm mt-1">Add or edit bespoke branding services.</p>
        </div>
        <Link href="/admin/services/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Service
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service: any) => (
                <tr key={service._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden relative">
                      {service.image ? (
                        <Image src={service.image} alt={service.name} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4">
                    {service.isFeatured ? (
                      <span className="badge-green">Featured</span>
                    ) : (
                      <span className="badge bg-gray-100 text-gray-700">Standard</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/services/${service._id}/edit`}
                      className="text-primary-600 hover:text-primary-800 transition-colors"
                      title="Edit Service"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <DeleteServiceButton serviceId={service._id.toString()} />
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No services found. Click "Add Service" to create one.
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
