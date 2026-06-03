import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight, Shield, Truck, RotateCcw } from "lucide-react";
import type { Metadata } from "next";
import { buildProductMetadata } from "@/lib/seo";
import ProductJsonLd from "@/components/seo/JsonLd";



interface ProductPageParams {
  slug: string;
}

interface ProductPageProps {
  params: Promise<ProductPageParams>;
}

interface ProductDetail {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  pricePerYard: number;
  stock: number;
  images: string[];
  category?: string;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  await connectDB();
  const product = await Product.findOne({ slug: params.slug }).lean();
  if (!product) return { title: "Product Not Found" };
  return buildProductMetadata({
    name: product.name,
    description: product.description,
    slug: product.slug,
    images: product.images,
    pricePerYard: product.pricePerYard,
    category: product.category,
  });
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  await connectDB();
  const product = await Product.findOne({ slug }).lean();
  if (!product) return null;
  const parsed: ProductDetail = JSON.parse(JSON.stringify(product));
  return parsed;
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const product = await getProduct(params.slug);
  if (!product) notFound();


  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="bg-surface min-h-screen">
      <ProductJsonLd {...product} />
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-border-light">
        <div className="page-container py-4">
          <nav className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-ink transition-colors">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link
                  href={`/shop?category=${product.category}`}
                  className="hover:text-ink transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="page-container py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Gallery */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <span className="badge-gold text-xs">{product.category}</span>
            )}

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-bold text-primary-600">
                {formatCurrency(product.pricePerYard)}
              </span>
              <span className="text-ink-muted text-base">per 6 yards</span>
            </div>

            {/* Stock Status */}
            <div>
              {isOutOfStock ? (
                <span className="badge-red">Out of Stock</span>
              ) : isLowStock ? (
                <span className="badge bg-red-50 text-red-600 border border-red-100">
                  ⚡ Only {product.stock} left — order soon!
                </span>
              ) : (
                <span className="badge-green">
                  In Stock — {product.stock} yards available
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-ink-secondary text-base leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="divider-warm" />

            {/* Add to Cart / Quantity */}
            <ProductActions product={product} />

            <div className="divider-warm" />

            {/* Trust Signals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Truck className="w-4 h-4" />, text: "Fast Delivery" },
                {
                  icon: <Shield className="w-4 h-4" />,
                  text: "Secure Payment",
                },
                {
                  icon: <RotateCcw className="w-4 h-4" />,
                  text: "Quality Guaranteed",
                },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 text-sm text-ink-secondary"
                >
                  <span className="text-gold-600">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
