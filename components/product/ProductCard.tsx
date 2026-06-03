"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Eye, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import toast from "react-hot-toast";
import type { MouseEvent } from "react";

export interface ProductCardProduct {
  _id: string;
  name: string;
  slug: string;
  pricePerYard: number;
  images?: string[];
  stock: number;
  category?: string;
}

interface ProductCardProps {
  product: ProductCardProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, slug, pricePerYard, images, stock, category, _id } = product;
  const isOutOfStock = stock === 0;
  const maxBundles = Math.floor(stock / 6);
  const isLowStock = maxBundles > 0 && maxBundles <= 2;
  const primaryImage = images?.[0] || "/placeholder-fabric.jpg";
  const { dispatch, cart } = useCart();
  const { toggleWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();

  const saved = isInWishlist(_id);

  const inCart = cart.items.find((i) => i.productId === _id);
  const canAdd = !isOutOfStock && (!inCart || inCart.quantity < maxBundles);

  function handleQuickAdd(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;

    dispatch({
      type: "ADD_ITEM",
      item: {
        productId: _id,
        name,
        price: pricePerYard,
        quantity: 1,
        stock,
        image: primaryImage,
        slug,
      },
    });
    toast.success(`${name} added to cart!`);
  }

  async function handleWishlistToggle(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(_id);
  }

  return (
    <Link href={`/product/${slug}`} className="block group">
      <div className="card-gold">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-surface-muted overflow-hidden">
          <Image
            src={primaryImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover img-zoom"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white text-ink text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Category Badge */}
          {category && (
            <span className="absolute top-3 left-3 glass text-ink text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              {category}
            </span>
          )}

          {/* Wishlist Button */}
          {!wishlistLoading && (
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all shadow-sm ${
                saved 
                  ? "bg-white text-red-500 scale-110" 
                  : "glass text-ink-muted hover:text-red-500 hover:scale-110"
              }`}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Low Stock Badge */}
          {isLowStock && (
            <span className="absolute top-3 right-14 bg-red-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              Only {stock} left
            </span>
          )}

          {/* Quick Actions - appear on hover */}
          {!isOutOfStock && (
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={!canAdd}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-sm text-ink font-semibold text-xs py-2.5 rounded-lg hover:bg-gold-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {canAdd ? "Quick Add" : "In Cart"}
              </button>
              <span className="flex items-center justify-center bg-white/95 backdrop-blur-sm text-ink px-3 py-2.5 rounded-lg hover:bg-gold-50 transition-colors shadow-sm">
                <Eye className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 sm:p-5">
          <h3 className="font-semibold text-ink text-sm leading-snug truncate mb-1.5 group-hover:text-primary-700 transition-colors">
            {name}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-primary-600 font-bold text-lg">
              {formatCurrency(pricePerYard)}
            </span>
            <span className="text-ink-muted font-normal text-xs">
              / 6 yards
            </span>
          </div>

          {!isOutOfStock && !isLowStock && (
            <p className="text-xs text-ink-muted mt-1">
              {stock} yards available
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
