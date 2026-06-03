"use client";

import Link from "next/link";
import { WifiOff, Home, ShoppingBag, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-border-light rounded-2xl p-10 shadow-sm space-y-6">
        <div className="mx-auto w-20 h-20 bg-surface-muted rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-ink-muted" />
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-ink mb-2">
            You're currently offline
          </h1>
          <p className="text-ink-secondary text-sm leading-relaxed">
            It looks like you've lost your internet connection. We couldn't load the page you were looking for.
          </p>
        </div>

        <div className="divider-warm" />

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Try Again
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-white text-ink font-medium text-sm hover:bg-surface-muted transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            
            <Link
              href="/cart"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-white text-ink font-medium text-sm hover:bg-surface-muted transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Cart
            </Link>
          </div>
        </div>

        <p className="text-xs text-ink-muted pt-2">
          Pages you've already visited and items in your cart are still available offline!
        </p>
      </div>
    </div>
  );
}
