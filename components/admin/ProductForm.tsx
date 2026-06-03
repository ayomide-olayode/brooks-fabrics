"use client";

import { useState } from "react";
import type { ChangeEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Image from "next/image";
import { X, Upload } from "lucide-react";

export interface ProductFormProduct {
  _id: string;
  name: string;
  description?: string;
  pricePerYard: number;
  stock: number;
  category?: string;
  isFeatured?: boolean;
  images: string[];
}

interface ProductFormValues {
  name: string;
  description?: string;
  pricePerYard: number | string;
  stock: number | string;
  category?: string;
  isFeatured: boolean;
}

interface ProductFormProps {
  product?: ProductFormProduct;
}

export default function ProductForm({ product }: ProductFormProps) {
  const isEdit = !!product;
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      pricePerYard: product?.pricePerYard || "",
      stock: product?.stock ?? "",
      category: product?.category || "",
      isFeatured: product?.isFeatured || false,
    },
  });

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file as Blob);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data: { url?: string } = await res.json();
        if (typeof data.url === "string") {
          if (data.url)
            setImages((prev: string[]) => [...prev, data.url as string]);
        }
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev: string[]) => prev.filter((i) => i !== url));
  }

  async function onSubmit(data: ProductFormValues) {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...data,
        pricePerYard: Number(data.pricePerYard),
        stock: parseInt(String(data.stock), 10),
        isFeatured: Boolean(data.isFeatured),
        images,
      };

      const url = isEdit ? `/api/products/${product._id}` : "/api/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      toast.success(isEdit ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save product";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
      {/* Name */}
      <div>
        <label className="label">Name *</label>
        <input
          {...register("name", { required: "Product name is required" })}
          className="input-field"
          placeholder="e.g. Vibrant Kente Ankara"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="input-field resize-none"
          placeholder="Describe the fabric, pattern, material…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label className="label">Price per piece / 6 yards (₦) *</label>
          <input
            {...register("pricePerYard", {
              required: "Price is required",
              min: { value: 0, message: "Price must be positive" },
            })}
            type="number"
            step="1"
            min="0"
            className="input-field"
            placeholder="e.g. 1500"
          />
          {errors.pricePerYard && (
            <p className="text-red-500 text-xs mt-1">
              {errors.pricePerYard.message as string}
            </p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="label">Stock (yards) *</label>
          <input
            {...register("stock", {
              required: "Stock is required",
              min: { value: 0, message: "Stock cannot be negative" },
            })}
            type="number"
            step="1"
            min="0"
            className="input-field"
            placeholder="e.g. 50"
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">
              {errors.stock.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <input
          {...register("category")}
          className="input-field"
          placeholder="e.g. Traditional, Modern, Wax Print…"
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3">
        <input
          {...register("isFeatured")}
          type="checkbox"
          id="isFeatured"
          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
        />
        <label
          htmlFor="isFeatured"
          className="text-sm font-medium text-gray-700"
        >
          Feature on homepage
        </label>
      </div>

      {/* Images */}
      <div>
        <label className="label">Images *</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {images.map((url) => (
            <div
              key={url}
              className="relative w-20 h-20 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt="Product image"
                fill
                sizes="80px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}

          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-primary-500 transition-colors">
            <Upload className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{uploading ? "…" : "Upload"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
        {uploading && (
          <p className="text-xs text-gray-400">Uploading images…</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn-primary"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
