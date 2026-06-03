"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DeleteDeliveryButton({ locationId }: { locationId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this delivery location?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/delivery-locations/${locationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Location deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`text-red-600 hover:text-red-800 transition-colors ${
        isDeleting ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title="Delete Location"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
