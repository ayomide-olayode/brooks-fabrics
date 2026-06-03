import Link from "next/link";
import { ShoppingBag, Package, Star } from "lucide-react";

const ICONS = {
  shop: <ShoppingBag className="w-12 h-12" />,
  cart: <ShoppingBag className="w-12 h-12" />,
  orders: <Package className="w-12 h-12" />,
  products: <Package className="w-12 h-12" />,
  star: <Star className="w-12 h-12" />,
} as const;

interface EmptyStateCta {
  href: string;
  label: string;
}

interface EmptyStateProps {
  icon?: keyof typeof ICONS;
  title: string;
  description?: string;
  cta?: EmptyStateCta;
}

export default function EmptyState({
  icon = "shop",
  title,
  description,
  cta,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-24 h-24 rounded-3xl bg-surface-muted border border-border-light flex items-center justify-center mb-6 text-ink-muted">
        {ICONS[icon] || ICONS.shop}
      </div>
      <h3 className="text-xl font-bold text-ink mb-2 font-heading">{title}</h3>
      {description && (
        <p className="text-ink-secondary text-sm max-w-xs mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {cta && (
        <Link href={cta.href} className="btn-primary">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
