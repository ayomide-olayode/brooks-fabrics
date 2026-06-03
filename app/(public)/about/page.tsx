import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, ShieldCheck, Sparkles, Heart } from "lucide-react";

export { aboutMetadata as metadata } from "@/lib/page-metadata";

export default function AboutPage() {
  return (
    <div className="bg-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-[#022c22] text-white">
        <div className="absolute inset-0 pattern-ankara opacity-20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-500/8 rounded-full blur-[150px]" />

        <div className="absolute inset-0 opacity-15">
          <Image
            src="https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=2069&auto=format&fit=crop"
            alt=""
            fill
            className="object-cover"
            aria-hidden="true"
          />
        </div>

        <div className="relative page-container py-24 sm:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-gold-300 font-medium text-xs uppercase tracking-widest">
                Brooks MM International
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-display-xl font-bold leading-[1.1] mb-6">
              For you, we&apos;ll{" "}
              <span className="text-shimmer-gold">do it</span>.
            </h1>

            <p className="text-lg sm:text-xl text-primary-100/70 mb-10 max-w-xl leading-relaxed">
              A global leader in fabrics and fashion, delivering premium quality
              products to celebrate cultural diversity without compromising on
              affordability.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop Fabrics
              </Link>
              <Link
                href="/services"
                className="btn-outline border-white/20 text-white hover:border-gold-400 hover:text-gold-400 hover:bg-transparent"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path
              d="M0 60V30C240 5 480 0 720 10C960 20 1200 45 1440 30V60H0Z"
              fill="#FDFBF7"
            />
          </svg>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 sm:py-28 page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gold-400/10 rounded-3xl rotate-2" />
            <Image
              src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop"
              alt="Quality African Fabrics"
              width={600}
              height={800}
              className="relative rounded-2xl shadow-elevated object-cover"
            />
          </div>

          <div className="space-y-10">
            <div>
              <span className="text-gold-600 font-semibold text-sm uppercase tracking-widest mb-3 block">
                Our Purpose
              </span>
              <h2 className="font-heading text-display-md font-bold text-ink mb-4">
                Our Mission
              </h2>
              <p className="text-ink-secondary text-lg leading-relaxed">
                To provide world-class services in fabrics and fashion, blending
                tradition with modern trends. We are dedicated to enduring
                service delivery that optimally produces responsive customer
                satisfaction.
              </p>
            </div>
            <div className="divider-gold" />
            <div>
              <h2 className="font-heading text-display-md font-bold text-ink mb-4">
                Our Vision
              </h2>
              <p className="text-ink-secondary text-lg leading-relaxed">
                To become a global leader in fabrics and fashion, delivering
                premium quality products, and celebrating cultural diversity
                everywhere we go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20 sm:py-28 border-y border-border-light">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold-600 font-semibold text-sm uppercase tracking-widest mb-3 block">
              What Drives Us
            </span>
            <h2 className="font-heading text-display-md font-bold text-ink mb-4">
              Our Core Values
            </h2>
            <p className="text-ink-secondary text-lg">
              The foundational pillars that guide our commitment to excellence,
              luxury, and approachability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Quality Excellence",
                body: "Uncompromising standards in every yard of fabric and every custom print we produce.",
                color: "text-gold-600",
                bg: "bg-gold-50",
                border: "border-gold-100",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Innovation",
                body: "Blending deep-rooted traditions with emerging modern fashion trends seamlessly.",
                color: "text-primary-600",
                bg: "bg-primary-50",
                border: "border-primary-100",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Global Impact",
                body: "A one-stop global shop extending deliveries to states across Europe and America.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: "Customer First",
                body: "Building a genuinely customer-friendly business focused on responsive satisfaction.",
                color: "text-primary-600",
                bg: "bg-primary-50",
                border: "border-primary-100",
              },
            ].map(({ icon, title, body, color, bg, border }) => (
              <div
                key={title}
                className={`p-7 rounded-2xl border ${border} bg-white hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div
                  className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-5 ${color} group-hover:scale-110 transition-transform duration-300`}
                >
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{title}</h3>
                <p className="text-ink-secondary text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 page-container text-center">
        <span className="text-gold-600 font-semibold text-sm uppercase tracking-widest mb-3 block">
          Get Started
        </span>
        <h2 className="font-heading text-display-md font-bold text-ink mb-6">
          Ready to Experience True Quality?
        </h2>
        <p className="text-ink-secondary text-lg mb-10 max-w-2xl mx-auto">
          Whether you need authentic Ankara fabrics, dazzling Lace, or custom
          T-shirt branding, Brooks MM International is your ultimate
          destination.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="btn-primary gap-2">
            Browse Shop
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/services"
            className="btn-secondary group flex items-center gap-2"
          >
            View Our Services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
