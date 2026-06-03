import { getServerSession } from "next-auth/next";
import { customerAuthOptions } from "@/lib/auth/customerAuth";
import connectDB from "@/lib/db/mongoose";
import Customer from "@/lib/db/models/Customer";
import ProductCard from "@/components/product/ProductCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist | Brooks Fabrics",
};

export default async function WishlistPage() {
  const session = await getServerSession(customerAuthOptions);

  if (!session?.user?.id) {
    redirect("/auth?next=/account/wishlist");
  }

  await connectDB();
  const customer = await Customer.findById(session.user.id).populate({
    path: "wishlist",
    model: "Product",
    select: "name slug pricePerYard images stock category",
  });

  if (!customer) {
    redirect("/auth");
  }

  const savedProducts = customer.wishlist || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-heading text-ink">My Wishlist</h1>
        <span className="text-ink-muted text-sm">{savedProducts.length} items</span>
      </div>

      {savedProducts.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-2">
            <Heart className="w-8 h-8 text-ink-muted" />
          </div>
          <h2 className="text-lg font-bold text-ink">Your wishlist is empty</h2>
          <p className="text-ink-secondary max-w-sm">
            Save items you love to your wishlist to easily find them later or keep track of fabrics for future projects.
          </p>
          <Link href="/shop" className="btn-primary mt-2">
            Browse Shop <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProducts.map((product: any) => (
            <ProductCard
              key={product._id.toString()}
              product={{
                _id: product._id.toString(),
                name: product.name,
                slug: product.slug,
                pricePerYard: product.pricePerYard,
                images: product.images,
                stock: product.stock,
                category: product.category,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
