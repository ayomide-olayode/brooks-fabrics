"use client";

import { useRouter } from "next/navigation";

interface ShopFiltersProps {
  categories: string[];
  selected: string;
}

import { slugify } from "@/lib/utils";

export default function ShopFilters({
  categories,
  selected,
}: ShopFiltersProps) {
  const router = useRouter();

  function handleSelect(cat: string) {
    if (cat) {
      router.push(`/shop/${slugify(cat)}`);
    } else {
      router.push(`/shop`);
    }
  }

  if (!categories.length) return null;

  return (
    <div className="flex items-center gap-2.5 mb-8 flex-wrap">
      {/* All chip */}
      <button
        onClick={() => handleSelect("")}
        className={`chip ${!selected ? "chip-active" : ""}`}
      >
        All
      </button>

      {/* Category chips */}
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => handleSelect(cat)}
          className={`chip ${selected === cat ? "chip-active" : ""}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
