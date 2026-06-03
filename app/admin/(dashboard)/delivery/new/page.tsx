import DeliveryForm from "@/components/admin/DeliveryForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Add Delivery Location" };

export default function NewDeliveryPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Location</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new delivery zone and set its fee.</p>
        </div>
      </div>

      <DeliveryForm />
    </div>
  );
}
