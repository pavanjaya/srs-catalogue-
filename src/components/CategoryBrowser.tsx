"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  // /catalogues?category=Wall+Sconces jumps straight into one category —
  // used by the admin panel's "Share category" button, and by clicking a
  // tile below. No category in the URL shows the category grid instead.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("category");
  const active = requested && categories.find((c) => c === requested) ? (requested as ProductCategory) : null;

  function open(category: ProductCategory) {
    router.push(`${pathname}?category=${encodeURIComponent(category)}`, { scroll: false });
  }

  function goBack() {
    router.push(pathname, { scroll: false });
  }

  if (!active) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const products = byCategory.get(category) ?? [];
          const cover = products[0];
          const count = products.filter((p) => !p.placeholder).length;
          return (
            <button
              key={category}
              onClick={() => open(category)}
              className="group text-left"
            >
              <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
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
              </div>
              <p className="font-sans-ui text-sm text-[var(--ink)]">{category}</p>
              <p className="font-sans-ui text-xs text-[var(--ink)]/50">
                {count > 0 ? `${count} piece${count === 1 ? "" : "s"}` : "Coming soon"}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  const products = byCategory.get(active) ?? [];

  return (
    <div>
      <button
        onClick={goBack}
        className="font-sans-ui mb-6 text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]"
      >
        ← All categories
      </button>
      <h2 className="font-sans-ui mb-6 text-lg text-[var(--ink)]">{active}</h2>

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
