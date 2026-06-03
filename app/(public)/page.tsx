import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/db/mongoose";
import Product from "@/lib/db/models/Product";
export { homepageMetadata as metadata } from "@/lib/page-metadata";
import ProductGrid from "@/components/product/ProductGrid";
import {
  Palette,
  Ruler,
  Truck,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";

async function getFeaturedProducts() {
  await connectDB();
  const products = await Product.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-[#022c22] text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pattern-ankara opacity-20" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] animate-pulse-gold" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-[100px]" />

        <div className="page-container relative py-20 sm:py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-gold-300 font-medium text-xs uppercase tracking-widest">
                  Authentic African Prints
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-display-xl font-bold leading-[1.1] mb-6">
                Premium Ankara,{" "}
                <span className="text-shimmer-gold">Crafted for the World</span>
              </h1>

              <p className="text-primary-100/80 text-lg sm:text-xl leading-relaxed mb-10 max-w-md">
                Vibrant, high-quality fabrics sourced with care — perfect for
                fashion, home décor, and creative projects.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-ink font-bold rounded-xl hover:bg-gold-400 transition-all duration-200 hover:shadow-gold-glow active:scale-[0.97] text-base"
                >
                  Shop Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-200 active:scale-[0.97] text-base"
                >
                  WhatsApp Us
                </Link>
              </div>

              {/* Trust Indicator */}
              <div className="flex items-center gap-3 mt-10 pt-8 border-t border-white/10">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 border-2 border-primary-900 flex items-center justify-center"
                    >
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-white font-semibold">2,000+</span>{" "}
                  <span className="text-primary-200/70">happy customers</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative group hidden lg:block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gold-400/15 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              {/* Gold ring */}
              <div className="absolute -inset-4 border-2 border-gold-500/20 rounded-3xl rotate-3 group-hover:rotate-0 transition-transform duration-700" />

              <div className="relative aspect-square flex items-center justify-center p-8 lg:p-12 animate-float">
                <Image
                  src="/images/Hero.png"
                  alt="Brooks Fabrics — Premium African Ankara Prints"
                  width={450}
                  height={450}
                  priority
                  className="w-full max-w-[450px] h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path
              d="M0 60V30C240 5 480 0 720 10C960 20 1200 45 1440 30V60H0Z"
              fill="#FDFBF7"
            />
          </svg>
        </div>
      </section>

      {/* ─── Trust Bar ─── */}
      <section className="bg-surface relative z-10">
        <div className="page-container py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="w-6 h-6" />,
                title: "Authentic Prints",
                body: "Genuine Ankara patterns with vibrant, lasting colours sourced directly from trusted producers.",
                color: "text-primary-600",
                bg: "bg-primary-50",
              },
              {
                icon: <Ruler className="w-6 h-6" />,
                title: "Sold by the Yard",
                body: "Order exactly what you need — no minimum waste, no compromises on quantity.",
                color: "text-gold-600",
                bg: "bg-gold-50",
              },
              {
                icon: <Truck className="w-6 h-6" />,
                title: "Fast Delivery",
                body: "Reliable shipping across Nigeria and international orders handled with care.",
                color: "text-primary-600",
                bg: "bg-primary-50",
              },
            ].map(({ icon, title, body, color, bg }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-light hover:shadow-card hover:border-border transition-all duration-300 group"
              >
                <div
                  className={`${bg} ${color} p-3 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300`}
                >
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-ink text-base mb-1">
                    {title}
                  </h3>
                  <p className="text-ink-secondary text-sm leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="page-container py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-widest mb-2 block">
              Curated Selection
            </span>
            <h2 className="font-heading text-display-md font-bold text-ink">
              Featured Fabrics
            </h2>
            <p className="text-ink-secondary mt-2 text-base max-w-md">
              Hand-picked styles our customers love — vibrant patterns, premium
              quality.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm group transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          <div className="text-center py-20 text-ink-muted">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-gold-400" />
            <p className="text-lg font-medium">
              Check back soon for featured fabrics.
            </p>
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/shop" className="btn-primary">
            View All Products
          </Link>
        </div>
      </section>

      {/* ─── Brand Story Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 py-20 sm:py-28">
        <div className="absolute inset-0 pattern-dots opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/8 rounded-full blur-[120px]" />

        <div className="page-container relative text-center max-w-3xl mx-auto">
          <span className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-4 block">
            Our Promise
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            &ldquo;For you, we&apos;ll{" "}
            <span className="text-shimmer-gold">do it</span>.&rdquo;
          </h2>
          <p className="text-primary-100/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            From the vibrant markets of West Africa to your doorstep — we bring
            you fabrics that celebrate culture, craftsmanship, and creativity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="btn-outline border-white/20 text-white hover:border-gold-400 hover:text-gold-400 hover:bg-transparent"
            >
              Our Story
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold-500 text-ink font-bold rounded-xl hover:bg-gold-400 transition-all duration-200 hover:shadow-gold-glow active:scale-[0.97]"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
