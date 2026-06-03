"use client";

import { useRouter, useSearchParams } from "next/navigation";

const LABELS = {
  "": "All",
  new: "New",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;

type OrderStatus = keyof typeof LABELS;
const STATUSES: OrderStatus[] = [
  "",
  "new",
  "processing",
  "delivered",
  "cancelled",
];

interface OrderStatusFilterProps {
  selected: string;
}

export default function OrderStatusFilter({
  selected,
}: OrderStatusFilterProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() =>
            router.push(s ? `/admin/orders?status=${s}` : "/admin/orders")
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selected === s
              ? "bg-primary-600 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
          }`}
        >
          {LABELS[s]}
        </button>
      ))}
    </div>
  );
}
