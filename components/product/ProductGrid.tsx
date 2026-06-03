import ProductCard from "./ProductCard";
import type { ProductCardProduct } from "./ProductCard";

interface ProductGridSkeletonProps {
  count?: number;
}

interface ProductGridProps {
  products: ProductCardProduct[];
}

export function ProductGridSkeleton({ count = 4 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="aspect-[4/3] skeleton" />
          <div className="p-4 sm:p-5 space-y-2.5">
            <div className="skeleton h-4 w-3/4 rounded-lg" />
            <div className="skeleton h-5 w-1/3 rounded-lg" />
            <div className="skeleton h-3 w-1/2 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {products.map((product, i) => (
        <div
          key={product._id || product.slug}
          className="animate-fade-up opacity-0"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
