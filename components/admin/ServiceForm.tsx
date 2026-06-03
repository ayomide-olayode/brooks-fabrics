"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import toast from "react-hot-toast";

interface ServiceFormData {
  name: string;
  description: string;
  shortDescription: string;
  isFeatured: boolean;
}

interface ServiceFormProps {
  initialData?: any;
}

export default function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string >(
    initialData?.image
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      shortDescription: initialData?.shortDescription || "",
      isFeatured: initialData?.isFeatured || false,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file as Blob);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImagePreview(data.url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, image: imagePreview };
      
      const url = initialData
        ? `/api/services/${initialData._id}`
        : "/api/services";
      const method = initialData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Something went wrong here");
      }

      toast.success(
        initialData ? "Service updated perfectly!" : "Service created successfully!"
      );
      router.push("/admin/services");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h3>
            
            <div className="mb-4">
              <label className="label">Service Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="input-field"
                placeholder="e.g. T-Shirt Branding"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message as string}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Short Description</label>
              <input
                {...register("shortDescription", { required: "Required" })}
                className="input-field"
                placeholder="A brief summary for cards"
              />
              {errors.shortDescription && (
                <p className="text-sm text-red-600 mt-1">{errors.shortDescription.message as string}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="label">Full Description</label>
              <textarea
                {...register("description", { required: "Required" })}
                className="input-field min-h-[120px]"
                placeholder="Detailed description of the service..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message as string}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                {...register("isFeatured")}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="isFeatured" className="text-gray-900 font-medium">
                Feature this service on the showcase
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Service Image</h3>
            
            <div className="mb-4">
              <label className="label">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-4"
              />
              {uploadingImage && <p className="text-sm text-gray-500">Uploading...</p>}
            </div>

            {imagePreview && (
              <div className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
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
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Service"}
        </button>
      </div>
    </form>
  );
}
