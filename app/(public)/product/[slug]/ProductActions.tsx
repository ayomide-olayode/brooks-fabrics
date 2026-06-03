"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";
import { ShoppingBag, Minus, Plus, Check, Heart } from "lucide-react";

export default function ProductActions({ product }: any) {
  const { _id, name, pricePerYard, stock, images, slug } = product;
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { dispatch, cart } = useCart();
  const { toggleWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();
  const isOutOfStock = stock === 0;

  const saved = isInWishlist(_id);

  const inCart = cart.items.find((i) => i.productId === _id);
const maxQty = Math.floor(stock / 6) - (inCart?.quantity || 0);
  function addToCart() {
    if (qty < 1 || qty > maxQty) return;

    dispatch({
      type: "ADD_ITEM",
      item: {
        productId: _id,
        name,
        price: pricePerYard,
        quantity: qty,
        stock,
        image: images?.[0] || "",
        slug,
      },
    });

    toast.success(`${name} added to cart!`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    setQty(1);
  }

  return (
    <div className="space-y-5">
      {/* Dynamic Total */}
      {!isOutOfStock && (
        <div className="bg-surface-warm rounded-xl px-5 py-4 border border-border-light">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink-secondary">Total for {qty * 6} yards:</span>
            <span className="font-bold text-ink text-xl">
              {formatCurrency(pricePerYard * qty)}
            </span>
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-ink">Quantity:</span>
          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="px-4 py-3 hover:bg-surface-muted disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 text-ink" />
            </button>
            <span className="px-5 py-3 text-sm font-bold text-ink min-w-[3.5rem] text-center border-x border-border-light bg-surface">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              className="px-4 py-3 hover:bg-surface-muted disabled:opacity-30 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 text-ink" />
            </button>
          </div>
          <span className="text-xs text-ink-muted">(max {maxQty})</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Add to Cart Button */}
        <button
          onClick={addToCart}
          disabled={isOutOfStock || maxQty <= 0}
          className={`flex-1 flex items-center justify-center gap-2.5 text-base py-4 px-8 rounded-xl font-bold transition-all duration-200 active:scale-[0.97] ${
            justAdded
              ? "bg-primary-600 text-white shadow-emerald-glow"
              : "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-emerald-glow"
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none`}
        >
          {justAdded ? (
            <>
              <Check className="w-5 h-5" />
              Added!
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              {isOutOfStock
                ? "Out of Stock"
                : maxQty <= 0
                ? "Already in Cart (max)"
                : "Add to Cart"}
            </>
          )}
        </button>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(_id)}
          disabled={wishlistLoading}
          className={`flex items-center justify-center gap-2.5 text-base py-4 px-8 rounded-xl font-bold transition-all duration-200 border-2 ${
            saved
              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              : "bg-white border-border text-ink-secondary hover:border-border-dark hover:text-ink"
          } disabled:opacity-50 active:scale-[0.97]`}
        >
          <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
