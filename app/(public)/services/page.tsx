import connectDB from "@/lib/db/mongoose";
import Service from "@/lib/db/models/Service";
import Image from "next/image";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

export { servicesMetadata as metadata } from "@/lib/page-metadata";

export default async function ServicesPage() {
  await connectDB();
  const services = await Service.find().sort({ createdAt: -1 }).lean();

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-[#022c22] text-white">
        <div className="absolute inset-0 pattern-dots opacity-40" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px]" />

        <div className="page-container relative py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6 mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="text-gold-300 font-medium text-xs uppercase tracking-widest">
              Beyond Fabrics
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-5">
            Our Premium <span className="text-shimmer-gold">Services</span>
          </h1>
          <p className="text-primary-100/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Beyond selling the finest fabrics, we offer specialized bespoke
            services to elevate your fashion brand and personal style.
          </p>
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

      <div className="page-container py-16">
        {services.length === 0 ? (
          <EmptyState
            icon="star"
            title="Coming Soon"
            description="We are currently updating our catalogue of services. Please check back later!"
            cta={{ label: "Browse Shop", href: "/shop" }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any, i: number) => {
              const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Hi, I am interested in your ${service.name} service. Can I get more details?`,
              )}`;

              return (
                <div
                  key={service._id}
                  className="card-gold flex flex-col animate-fade-up opacity-0"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="relative w-full h-64 bg-surface-muted overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover img-zoom"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-xl font-bold text-ink mb-2 font-heading">
                      {service.name}
                    </h2>
                    <p className="text-ink-secondary text-sm leading-relaxed mb-6 flex-1">
                      {service.description}
                    </p>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#128C7E] transition-all duration-200 active:scale-[0.97]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Inquire via WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-20 py-16 border-t border-border-light">
          <h3 className="font-heading text-2xl font-bold text-ink mb-4">
            Need Something Custom?
          </h3>
          <p className="text-ink-secondary mb-8 max-w-md mx-auto">
            We&apos;re always open to bespoke requests. Reach out to us and
            let&apos;s create something special together.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
