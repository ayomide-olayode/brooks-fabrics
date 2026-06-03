import ServiceForm from "@/components/admin/ServiceForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Add New Service" };

export default function NewServicePage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new bespoke service to offer clients.</p>
        </div>
      </div>

      <ServiceForm />
    </div>
  );
}
