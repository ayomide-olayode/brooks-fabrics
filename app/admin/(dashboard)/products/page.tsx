import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import ProductActions from "./ProductActions";

export const metadata = { title: "Products" };

interface AdminProduct {
  _id: string;
  name: string;
  pricePerYard: number;
  stock: number;
  images?: string[];
  category?: string;
  isFeatured?: boolean;
}

async function getProducts(): Promise<AdminProduct[]> {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  const parsed: AdminProduct[] = JSON.parse(JSON.stringify(products));
  return parsed;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} total
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-gray-400 text-lg mb-2">No products yet.</p>
          <p className="text-gray-400 text-sm mb-6">
            Add your first fabric to the store.
          </p>
          <Link href="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Price / yard</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-left">Featured</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 max-w-[180px] truncate">
                            {product.name}
                          </p>
                          {product.category && (
                            <p className="text-xs text-gray-400">
                              {product.category}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {formatCurrency(product.pricePerYard)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          product.stock === 0
                            ? "badge-red"
                            : product.stock < 10
                              ? "badge-yellow"
                              : "badge-green"
                        }
                      >
                        {product.stock} yds
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">
                      {product.isFeatured ? (
                        <span className="text-gold-500 font-semibold">
                          ★ Yes
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ProductActions productId={product._id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
