"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Store,
  Briefcase,
  Truck,
  BellDot,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/push", label: "Broadcast", icon: BellDot },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-300 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-base font-bold text-white">Brooks MM</span>
              <span className="font-heading text-base font-bold text-gold-400">International</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-700 text-white"
                  : "hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Store className="w-4 h-4 shrink-0" />
          View Store
        </Link>
        <button
          onClick={() => {
            onClose();
            signOut({ callbackUrl: "/admin/login" });
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  );
}
