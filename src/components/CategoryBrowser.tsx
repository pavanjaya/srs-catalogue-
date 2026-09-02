"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Product, ProductCategory } from "@/lib/products";

export function CategoryBrowser({
  categories,
  byCategory,
  linkPrefix = "/catalogue",
}: {
  categories: readonly ProductCategory[];
  byCategory: Map<ProductCategory, Product[]>;
  linkPrefix?: string;
}) {
  const firstNonEmpty = categories.find((c) => (byCategory.get(c) ?? []).length > 0) ?? categories[0];

  // Supports a direct link into one category — /catalogues?category=Wall+Sconces
  // — so the admin panel's "Share category" button has somewhere to point.
  const searchParams = useSearchParams();
  const requested = searchParams.get("category");
  const initial =
    (requested && categories.find((c) => c === requested)) || firstNonEmpty;

  const [active, setActive] = useState<ProductCategory>(initial);
  const products = byCategory.get(active) ?? [];

  return (
    <div>
      <div className="font-sans-ui -mx-6 mb-8 overflow-x-auto border-y border-[var(--line)] px-6">
        <div className="flex gap-1 py-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm whitespace-nowrap transition ${
                active === category
                  ? "bg-[var(--ink)] text-white"
                  : "text-[var(--ink)]/60 hover:text-[var(--ink)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="font-sans-ui py-10 text-sm text-[var(--ink)]/50">
          More pieces from this category are on their way.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <Link key={product.slug} href={`${linkPrefix}/${product.slug}`} className="group block">
              <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="h-auto w-full object-cover transition group-hover:opacity-80"
                />
              </div>
              <p className="font-sans-ui truncate text-xs text-[var(--ink)]/80">
                {product.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
