import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import ProductForm from "@/components/admin/ProductForm";
import type { ProductFormProduct } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product" };

async function getProduct(id: string): Promise<ProductFormProduct | null> {
  await connectDB();
  try {
    const product = await Product.findById(id).lean();
    if (!product) return null;
    const parsed: ProductFormProduct = JSON.parse(JSON.stringify(product));
    return parsed;
  } catch {
    return null;
  }
}

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
