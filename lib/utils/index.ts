import type { CartItem } from "@/context/CartContext";

/**
 * Format a number as Nigerian Naira
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert a product name to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Build a WhatsApp order message URL
 */
export function buildWhatsAppUrl(cartItems: CartItem[], total: number): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const lines = cartItems
    .map(
      (item) =>
        `- ${item.name} (${item.quantity} yard${item.quantity > 1 ? "s" : ""}) – ${formatCurrency(item.price * item.quantity)}`,
    )
    .join("\n");

  const message = `Hello, I'd like to order:\n${lines}\n\nSubtotal: ${formatCurrency(total)}\n+ Delivery (TBD based on location)`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Truncate a string to a max length
 */
export function truncate(str: string, max = 80): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/**
 * Safe JSON parse (returns fallback on error)
 */
export function safeJsonParse(str: string, fallback: unknown = null): unknown {
  try {
    const parsed: unknown = JSON.parse(str);
    return parsed;
  } catch {
    return fallback;
  }
}
