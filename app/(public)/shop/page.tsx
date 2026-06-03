import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import ProductGrid from "@/components/product/ProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import ShopFilters from "./ShopFilters";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export { shopMetadata as metadata } from "@/lib/page-metadata";

async function getProducts(): Promise<ProductCardProduct[]> {
  await connectDB();
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .limit(48)
    .lean();
  const parsed: ProductCardProduct[] = JSON.parse(JSON.stringify(products));
  return parsed;
}

async function getCategories(): Promise<string[]> {
  await connectDB();
  const cats = await Product.distinct("category");
  return cats.filter(Boolean);
}

interface ShopSearchParams {
  category?: string;
}

interface ShopPageProps {
  searchParams?: Promise<ShopSearchParams>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  if (resolvedParams?.category) {
    redirect(`/shop/${slugify(resolvedParams.category)}`);
  }

  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border-light">
        <div className="page-container py-8 sm:py-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-ink-muted mb-4">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink font-medium">Shop</span>
          </nav>

          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-heading text-display-md font-bold text-ink">
                Our Collection
              </h1>
              <p className="text-ink-secondary text-sm mt-1.5">
                {products.length} fabric{products.length !== 1 ? "s" : ""}{" "}
                available
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <ShopFilters categories={categories} selected="" />

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon="shop"
            title="No products found"
            description="No products available yet. Check back soon!"
          />
        )}
      </div>
    </div>
  );
}
