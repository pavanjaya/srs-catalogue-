"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product, ProductCategory } from "@/lib/products";
import { ShareModal } from "@/components/ShareModal";

// Admin landing: a grid of category tiles. Clicking one opens the
// preview-and-share modal for that category — no page navigation.
export function AdminCategoryBrowser({
  categories,
  byCategory,
  brochures = {},
}: {
  categories: readonly ProductCategory[];
  byCategory: Map<ProductCategory, Product[]>;
  brochures?: Partial<Record<ProductCategory, string>>;
}) {
  const [openCategory, setOpenCategory] = useState<ProductCategory | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const products = byCategory.get(category) ?? [];
          const cover = products[0];
          const count = products.filter((p) => !p.placeholder).length;
          const hasBrochure = !!brochures[category];
          return (
            <button key={category} onClick={() => setOpenCategory(category)} className="group text-left">
              <div className="relative mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                {cover ? (
                  <Image
                    src={cover.image}
                    alt={category}
                    width={400}
                    height={400}
                    className="aspect-square h-auto w-full object-cover transition group-hover:opacity-80"
                  />
                ) : (
                  <div className="aspect-square bg-[var(--paper-2)]" />
                )}
                {hasBrochure && (
                  <span className="font-sans-ui absolute top-2 right-2 rounded-full bg-[var(--ink)] px-2 py-1 text-[10px] tracking-[0.1em] text-white uppercase">
                    PDF
                  </span>
                )}
              </div>
              <p className="font-sans-ui text-sm text-[var(--ink)]">{category}</p>
              <p className="font-sans-ui text-xs text-[var(--ink)]/50">
                {count > 0 ? `${count} piece${count === 1 ? "" : "s"}` : "Coming soon"}
              </p>
            </button>
          );
        })}
      </div>

      {openCategory && (
        <ShareModal
          category={openCategory}
          products={byCategory.get(openCategory) ?? []}
          brochureUrl={brochures[openCategory]}
          onClose={() => setOpenCategory(null)}
        />
      )}
    </>
  );
}
