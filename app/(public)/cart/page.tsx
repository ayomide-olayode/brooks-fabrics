"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency, buildWhatsAppUrl } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import {
  Minus,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

export default function CartPage() {
  const { cart, dispatch, cartSubtotal } = useCart();
  const total = cartSubtotal;

  function updateQty(productId: string, quantity: number, stock: number) {
    if (quantity < 1) return;
    if (quantity * 6 > stock) return;
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  }

  function remove(productId: string) {
    dispatch({ type: "REMOVE_ITEM", productId });
  }

  if (!cart.items.length) {
    return (
      <div className="page-container py-10">
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          description="Looks like you haven't added any fabrics yet."
          cta={{ href: "/shop", label: "Continue Shopping" }}
        />
      </div>
    );
  }

  const whatsappUrl = buildWhatsAppUrl(cart.items, total);

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border-light">
        <div className="page-container py-6">
          <nav className="flex items-center gap-1.5 text-sm text-ink-muted mb-3">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-ink transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink font-medium">Cart</span>
          </nav>
          <h1 className="font-heading text-display-md font-bold text-ink">
            Your Cart
            <span className="text-ink-muted text-lg font-sans font-normal ml-3">
              ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="card flex gap-4 sm:gap-5 p-4 sm:p-5 items-start group"
              >
                {/* Image */}
                <Link
                  href={`/product/${item.slug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-surface-muted border border-border-light"
                >
                  <Image
                    src={item.image || "/placeholder-fabric.jpg"}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-semibold text-ink text-sm sm:text-base hover:text-primary-600 truncate block transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-ink-muted text-xs mt-0.5">
                    {formatCurrency(item.price)} / 6 yds
                  </p>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.quantity - 1, item.stock)
                      }
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-muted disabled:opacity-30 transition-all"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-8 text-center text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.quantity + 1, item.stock)
                      }
                      disabled={item.quantity >= Math.floor(item.stock / 6)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-muted disabled:opacity-30 transition-all"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <p className="font-bold text-ink text-base">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => remove(item.productId)}
                    className="p-2 rounded-lg text-ink-muted hover:text-red-500 hover:bg-red-50 transition-all"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-primary-600 font-medium transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="card p-6 h-fit space-y-5 sticky top-28">
            <h2 className="font-heading text-xl font-bold text-ink">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-ink-secondary">
                <span>Subtotal</span>
                <span className="font-medium text-ink">
                  {formatCurrency(cartSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-ink-secondary">
                <span>Delivery</span>
                <span className="italic text-ink-muted">
                  Calculated at checkout
                </span>
              </div>
              <div className="divider-warm" />
              <div className="flex justify-between font-bold text-ink text-lg">
                <span>Estimated Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full text-center block text-base"
            >
              Proceed to Checkout
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Order via WhatsApp
            </a>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-2 text-xs text-ink-muted pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
              Secure checkout powered by Paystack
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
