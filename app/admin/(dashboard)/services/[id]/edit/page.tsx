import ServiceForm from "@/components/admin/ServiceForm";
import connectDB from "@/lib/db/mongoose";
import Service from "@/lib/db/models/Service";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Service" };

export default async function EditServicePage({ params }: any) {
  const { id } = await params;

  await connectDB();
  const service = await Service.findById(id).lean();

  if (!service) {
    notFound();
  }

  // Convert Mongo ID to string for client component
  const serializedService = {
    ...service,
    _id: service._id.toString(),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/services"
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Service</h1>
          <p className="text-gray-500 text-sm mt-1">Update details for {service.name}</p>
        </div>
      </div>

      <ServiceForm initialData={serializedService} />
    </div>
  );
}
