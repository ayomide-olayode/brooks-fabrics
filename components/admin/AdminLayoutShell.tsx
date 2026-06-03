"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-gray-900 text-white shadow-md z-10 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-base font-bold text-white">
              Brooks MM
            </span>
            <span className="font-heading text-base font-bold text-gold-400">
              Intl
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 -mr-1 text-gray-300 hover:text-white focus:outline-none"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
