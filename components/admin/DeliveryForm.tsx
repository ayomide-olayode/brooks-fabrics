"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface DeliveryFormData {
  name: string;
  fee: number;
  isActive: boolean;
}

interface DeliveryFormProps {
  initialData?: any;
}

export default function DeliveryForm({ initialData }: DeliveryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    defaultValues: {
      name: initialData?.name || "",
      fee: initialData ? initialData.fee : 1000,
      isActive: initialData ? initialData.isActive : true,
    },
  });

  const onSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/delivery-locations/${initialData._id}`
        : "/api/delivery-locations";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Something went wrong here");
      }

      toast.success(
        initialData ? "Location updated!" : "Location created successfully!"
      );
      router.push("/admin/delivery");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save location");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="card p-6 space-y-6">
        <div className="mb-4">
          <label className="label">Location Name (e.g. Lagos Island, Abuja, Port Harcourt)</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="input-field"
            placeholder="Area name..."
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="label">Delivery Fee (₦)</label>
          <input
            type="number"
            {...register("fee", { 
              required: "Fee is required",
              min: { value: 0, message: "Fee cannot be negative" }
            })}
            className="input-field"
            placeholder="e.g. 5000"
          />
          {errors.fee && (
            <p className="text-sm text-red-600 mt-1">{errors.fee.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            {...register("isActive")}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-gray-900 font-medium">
            Active (Show at checkout)
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Location"}
        </button>
      </div>
    </form>
  );
}
