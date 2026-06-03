"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { CheckCircle, Loader, ArrowRight, Package } from "lucide-react";

interface OrderItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  customerName: string;
  email: string;
  address?: string;
  items: OrderItem[];
  total: number;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { dispatch } = useCart();
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found.");
      setLoading(false);
      return;
    }

    async function verifyAndFetch(ref: string) {
      try {
        const res = await fetch(
          `/api/verify-payment?reference=${encodeURIComponent(ref)}`,
        );
        const data: { order?: OrderSummary; error?: string } = await res.json();

        if (!res.ok) {
          setError(data.error || "Payment verification failed.");
          return;
        }

        if (data.order) setOrder(data.order);
        dispatch({ type: "CLEAR_CART" });
      } catch {
        setError("Something went wrong. Please contact us.");
      } finally {
        setLoading(false);
      }
    }

    verifyAndFetch(reference);
  }, [reference, dispatch]);

  if (loading) {
    return (
      <div className="page-container py-28 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
            <Loader className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        </div>
        <p className="text-ink-secondary font-medium">
          Verifying your payment…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-28 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 font-bold text-lg mb-2">{error}</p>
        <p className="text-ink-secondary text-sm mb-8">
          If you believe this is an error, please contact us via WhatsApp.
        </p>
        <Link href="/shop" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="page-container py-16 sm:py-20 max-w-2xl mx-auto">
        <div className="card p-8 sm:p-10 text-center space-y-6">
          {/* Success Icon */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto shadow-emerald-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-2">
              Thank you for your order!
            </h1>
            <p className="text-ink-secondary text-base">
              Your payment was successful. We&apos;ll process your order and be
              in touch shortly.
            </p>
          </div>

          {order && (
            <div className="text-left border border-border-light rounded-2xl overflow-hidden mt-4">
              {/* Order Header */}
              <div className="bg-surface-warm px-6 py-4 border-b border-border-light flex items-center gap-3">
                <Package className="w-5 h-5 text-gold-600" />
                <span className="text-sm font-bold text-ink uppercase tracking-wider">
                  Order Details
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-ink-muted block text-xs mb-0.5">
                      Name
                    </span>
                    <span className="font-semibold text-ink">
                      {order.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-xs mb-0.5">
                      Email
                    </span>
                    <span className="font-semibold text-ink">
                      {order.email}
                    </span>
                  </div>
                  {order.address && (
                    <div className="sm:col-span-2">
                      <span className="text-ink-muted block text-xs mb-0.5">
                        Delivery to
                      </span>
                      <span className="font-semibold text-ink">
                        {order.address}
                      </span>
                    </div>
                  )}
                </div>

                <div className="divider-warm" />

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink-secondary">
                        {item.name} × {item.quantity} yd
                      </span>
                      <span className="font-semibold text-ink">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="divider-warm my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-ink">Total paid</span>
                    <span className="text-primary-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/shop"
            className="btn-primary inline-flex items-center gap-2 mt-4"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessLoading() {
  return (
    <div className="page-container py-28 flex flex-col items-center gap-5">
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
      <p className="text-ink-secondary font-medium">Loading…</p>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessLoading />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
