import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Display */}
        <div className="relative mb-8">
          <span className="text-[120px] sm:text-[150px] font-heading font-bold text-border leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center">
              <Search className="w-7 h-7 text-gold-600" />
            </div>
          </div>
        </div>

        <h1 className="font-heading text-2xl font-bold text-ink mb-3">
          Page Not Found
        </h1>
        <p className="text-ink-secondary text-base mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/shop" className="btn-outline">
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
