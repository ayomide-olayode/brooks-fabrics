import DeliveryForm from "@/components/admin/DeliveryForm";
import connectDB from "@/lib/db/mongoose";
import DeliveryLocation from "@/lib/db/models/DeliveryLocation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Delivery Location" };

export default async function EditDeliveryPage(props: any) {
  const params = await props.params;
  const { id } = params;

  await connectDB();
  const location = await DeliveryLocation.findById(id).lean();

  if (!location) {
    notFound();
  }

  // Convert Mongo ID and dates to string
  const serializedLocation = {
    ...location,
    _id: location._id.toString(),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/delivery"
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Location</h1>
          <p className="text-gray-500 text-sm mt-1">Update details for {location.name}</p>
        </div>
      </div>

      <DeliveryForm initialData={serializedLocation} />
    </div>
  );
}
