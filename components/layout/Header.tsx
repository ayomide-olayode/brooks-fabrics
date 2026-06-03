"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  Package,
  Heart,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
];

export default function Header() {
  const { cartCount, openCart } = useCart();
  const { customer, isAuthenticated, isLoading, logout } = useCustomerAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const initial = customer?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl shadow-card border-b border-border-light"
          : "bg-white border-b border-border-light"
      }`}
    >
      {/* Announcement Bar */}
      {/* <div className="bg-primary-900 text-white text-center py-2 px-4">
        <p className="text-xs sm:text-sm font-medium tracking-wide">
          <span className="text-gold-400">✦</span>
          {" "}Free delivery on orders above ₦50,000{" "}
          <span className="text-gold-400">✦</span>
        </p>
      </div> */}

      <div className="page-container flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Image
            src="/logo.png"
            alt="Brooks Fabrics Logo"
            width={130}
            height={130}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative px-4 py-2 text-ink-secondary hover:text-ink font-medium text-sm transition-colors duration-200 rounded-lg hover:bg-surface-muted group"
            >
              {label}
              <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-gold-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </nav>

        {/* Right: Auth + Cart + Hamburger */}
        <div className="flex items-center gap-2">
          {/* Auth — Desktop */}
          <div className="hidden md:block">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse" />
            ) : isAuthenticated && customer ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-surface-muted transition-all duration-200"
                  aria-label="Account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                    {initial}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-float border border-border-light py-2 animate-slide-down z-50">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-border-light">
                      <p className="text-sm font-semibold text-ink truncate">{customer.name}</p>
                      <p className="text-xs text-ink-muted truncate">{customer.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-ink-secondary" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted transition-colors"
                      >
                        <Package className="w-4 h-4 text-ink-secondary" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-surface-muted transition-colors"
                      >
                        <Heart className="w-4 h-4 text-ink-secondary" />
                        Wishlist
                      </Link>
                    </div>

                    <div className="border-t border-border-light pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="relative px-4 py-2 text-ink-secondary hover:text-ink font-medium text-sm transition-colors duration-200 rounded-lg hover:bg-surface-muted group"
              >
                Sign In
                <span className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-gold-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl hover:bg-surface-muted transition-all duration-200 group"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="w-5 h-5 text-ink-secondary group-hover:text-ink transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm animate-scale-in">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2.5 rounded-xl hover:bg-surface-muted transition-all duration-200"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-ink" />
            ) : (
              <Menu className="w-5 h-5 text-ink-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border-light bg-white px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink hover:bg-surface-muted font-medium transition-colors duration-200"
            >
              {label}
            </Link>
          ))}

          {/* Mobile: Auth Links */}
          <div className="border-t border-border-light pt-3 mt-2">
            {isAuthenticated && customer ? (
              <>
                <div className="px-4 py-2 mb-1">
                  <p className="text-sm font-semibold text-ink">{customer.name}</p>
                  <p className="text-xs text-ink-muted">{customer.email}</p>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink hover:bg-surface-muted font-medium transition-colors duration-200"
                >
                  <LayoutDashboard className="w-4 h-4 text-ink-secondary" />
                  My Account
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink hover:bg-surface-muted font-medium transition-colors duration-200"
                >
                  <Package className="w-4 h-4 text-ink-secondary" />
                  My Orders
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink hover:bg-surface-muted font-medium transition-colors duration-200"
                >
                  <Heart className="w-4 h-4 text-ink-secondary" />
                  Wishlist
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors duration-200 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink hover:bg-surface-muted font-medium transition-colors duration-200"
              >
                <User className="w-4 h-4 text-ink-secondary" />
                Sign In / Create Account
              </Link>
            )}
          </div>

          {/* Mobile Cart Link */}
          <button
            onClick={() => {
              setMenuOpen(false);
              openCart();
            }}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-ink hover:bg-surface-muted font-medium transition-colors duration-200 mt-2 border-t border-border-light pt-4 w-full text-left"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              Cart
            </span>
            {cartCount > 0 && (
              <span className="badge-gold text-[11px]">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
