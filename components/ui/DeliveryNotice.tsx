"use client";

import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";

export default function DeliveryNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("delivery-notice-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  function handleDismiss() {
    setIsVisible(false);
    sessionStorage.setItem("delivery-notice-dismissed", "true");
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-[100] animate-slide-up">
      <div className="glass bg-[#0F1A15]/90 backdrop-blur-xl text-white px-5 py-3.5 rounded-2xl shadow-float flex items-center justify-between gap-3 border border-white/10 max-w-full md:max-w-md mx-auto relative overflow-hidden">
        {/* Gold accent glow */}
        <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-gold-500/15 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-gold-400" />
          </div>

          <p className="text-[13px] sm:text-sm font-medium leading-snug">
            Delivery differs based on location and is calculated at checkout.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0 relative z-10"
          aria-label="Close notice"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
}
