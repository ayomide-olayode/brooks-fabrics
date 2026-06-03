import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import ProductGrid from "@/components/product/ProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import ShopFilters from "../ShopFilters";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { ProductCardProduct } from "@/components/product/ProductCard";
import { getCategoryMap } from "@/lib/categories";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const map = await getCategoryMap();
  const categoryName = map.get(resolvedParams.category);
  
  if (!categoryName) return {};

  return {
    title: `Premium ${categoryName} Fabrics | Brooks Fabrics`,
    description: `Shop authentic ${categoryName} fabrics. High-quality African prints delivered across Nigeria.`,
    alternates: {
      canonical: `/shop/${resolvedParams.category}`,
    },
  };
}

async function getProductsByCategory(categoryName: string): Promise<ProductCardProduct[]> {
  await connectDB();
  const products = await Product.find({ category: categoryName })
    .sort({ createdAt: -1 })
    .limit(48)
    .lean();
  const parsed: ProductCardProduct[] = JSON.parse(JSON.stringify(products));
  return parsed;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const map = await getCategoryMap();
  const categoryName = map.get(resolvedParams.category);

  if (!categoryName) {
    notFound();
  }

  const [products, categories] = await Promise.all([
    getProductsByCategory(categoryName),
    Array.from(map.values()),
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
            <Link href="/shop" className="hover:text-ink transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-600 font-medium">
              {categoryName}
            </span>
          </nav>

          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-heading text-display-md font-bold text-ink">
                {categoryName}
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
        <ShopFilters categories={categories} selected={categoryName} />

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon="shop"
            title="No products found"
            description={`No fabrics in "${categoryName}" yet. Try another category or check back soon.`}
            cta={{ href: "/shop", label: "View All" }}
          />
        )}
      </div>
    </div>
  );
}
