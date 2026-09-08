"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductCategory } from "@/lib/products";
import { ShareComposer } from "@/components/ShareComposer";

// Same grid-then-drilldown pattern as the public CategoryBrowser, but each
// tile/product also carries its Share control — this is where links
// actually get composed and sent.
export function AdminCategoryBrowser({
  categories,
  byCategory,
}: {
  categories: readonly ProductCategory[];
  byCategory: Map<ProductCategory, Product[]>;
}) {
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
            <button key={category} onClick={() => open(category)} className="group text-left">
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
      <button onClick={goBack} className="font-sans-ui mb-6 text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]">
        ← All categories
      </button>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-sans-ui text-lg text-[var(--ink)]">{active}</h2>
        <ShareComposer
          triggerLabel="Share category"
          dialogTitle={active}
          path={`/catalogues?category=${encodeURIComponent(active)}`}
          messageTemplate={`Hi, here's our full ${active} range 👇\n{url}\nBrowse the collection — open any piece for its own catalogue.`}
        />
      </div>

      {products.length === 0 ? (
        <p className="font-sans-ui py-10 text-sm text-[var(--ink)]/50">
          More pieces from this category are on their way.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <div key={product.slug} className="group">
              <Link href={`/catalogue/${product.slug}`} target="_blank" className="block">
                <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-auto w-full object-cover transition group-hover:opacity-80"
                  />
                </div>
              </Link>
              <div className="flex items-center justify-between gap-2">
                <p className="font-sans-ui truncate text-xs text-[var(--ink)]/80">{product.name}</p>
                <ShareComposer
                  dialogTitle={product.name}
                  path={`/catalogue/${product.slug}`}
                  messageTemplate={`Hi, here's the catalogue for ${product.name} you asked about 👇\n{url}\nYou can also browse our other designs from the same page.`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
