// ─────────────────────────────────────────────────────────────────────────────
// Copy the relevant export into each page file listed below.
// All use buildPageMetadata(title, description, path) from @/lib/seo
// ─────────────────────────────────────────────────────────────────────────────

import { buildPageMetadata } from "@/lib/seo";

// ── app/(public)/page.tsx (Homepage) ─────────────────────────────────────────
export const homepageMetadata = buildPageMetadata(
  "Premium Ankara Fabrics",
  "Shop authentic Ankara and African print fabrics online. Vibrant patterns, traditional prints, and modern designs delivered across Nigeria.",
  "/"
);

// ── app/(public)/shop/page.tsx ────────────────────────────────────────────────
export const shopMetadata = buildPageMetadata(
  "Shop Ankara Fabrics",
  "Browse our full collection of premium Ankara fabrics. Filter by category and find the perfect print for your next project.",
  "/shop"
);

// ── app/(public)/about/page.tsx ───────────────────────────────────────────────
export const aboutMetadata = buildPageMetadata(
  "About Us",
  "Learn about Brooks Fabrics — our story, mission, and commitment to bringing you the finest Ankara and African print fabrics in Nigeria.",
  "/about"
);

// ── app/(public)/services/page.tsx ────────────────────────────────────────────
export const servicesMetadata = buildPageMetadata(
  "Our Services",
  "Brooks Fabrics offers fabric sourcing, bulk orders, and custom fabric services. Get in touch to discuss your needs.",
  "/services"
);

// ── app/(public)/cart/page.tsx ────────────────────────────────────────────────
export const cartMetadata = buildPageMetadata(
  "Your Cart",
  "Review your selected Ankara fabrics and proceed to checkout.",
  "/cart"
);

// ─────────────────────────────────────────────────────────────────────────────
// USAGE: In each page file, add this above the default export:
//
// export { homepageMetadata as metadata } from "@/lib/page-metadata";
//
// Or inline it directly:
//
// import { buildPageMetadata } from "@/lib/seo";
// export const metadata = buildPageMetadata("Shop", "Browse our fabrics", "/shop");
// ─────────────────────────────────────────────────────────────────────────────