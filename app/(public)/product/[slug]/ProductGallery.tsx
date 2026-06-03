"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  images?: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const imgs = images?.length ? images : ["/placeholder-fabric.jpg"];

  function prev() {
    setSelected((s) => (s === 0 ? imgs.length - 1 : s - 1));
  }
  function next() {
    setSelected((s) => (s === imgs.length - 1 ? 0 : s + 1));
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-surface-muted cursor-zoom-in group border border-border-light"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={imgs[selected]}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            priority
          />

          {/* Zoom hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
              <ZoomIn className="w-5 h-5 text-ink" />
            </div>
          </div>

          {/* Image counter */}
          {imgs.length > 1 && (
            <div className="absolute bottom-3 right-3 glass-dark text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {selected + 1} / {imgs.length}
            </div>
          )}

          {/* Navigation arrows on main image */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-ink" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-ink" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                  i === selected
                    ? "border-gold-500 shadow-gold-glow ring-1 ring-gold-300"
                    : "border-border-light hover:border-border-dark"
                }`}
              >
                <Image
                  src={img}
                  alt={`${name} ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white/80 p-2.5 hover:bg-white/10 rounded-full transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {imgs.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 sm:left-6 text-white/80 p-3 hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 sm:right-6 text-white/80 p-3 hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-3xl aspect-square mx-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imgs[selected]}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          </div>

          {/* Lightbox counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
            {selected + 1} of {imgs.length}
          </div>
        </div>
      )}
    </>
  );
}
