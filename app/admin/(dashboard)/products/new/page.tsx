import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the details to add a new fabric.
        </p>
      </div>
      <ProductForm />
    </div>
  );
}
