"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product, ProductCategory } from "@/lib/products";

function CategoryTile({
  category,
  products,
  onClick,
}: {
  category: ProductCategory;
  products: Product[];
  onClick: () => void;
}) {
  const cover = products[0];
  const count = products.filter((p) => !p.placeholder).length;
  return (
    <button onClick={onClick} className="group text-left">
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
}

export function CategoryBrowser({
  categories,
  byCategory,
  linkPrefix = "/catalogue",
}: {
  categories: readonly ProductCategory[];
  byCategory: Map<ProductCategory, Product[]>;
  linkPrefix?: string;
}) {
  // /catalogues?category=Wall+Sconces — how a shared category link (from the
  // admin panel) or a tile click below lands here. With no category in the
  // URL, it's a general visit: show every category as a browsable grid.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("category");
  const active = requested && categories.find((c) => c === requested) ? (requested as ProductCategory) : null;

  function open(category: ProductCategory) {
    router.push(`${pathname}?category=${encodeURIComponent(category)}`, { scroll: false });
  }

  function clear() {
    router.push(pathname, { scroll: false });
  }

  if (!active) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryTile
            key={category}
            category={category}
            products={byCategory.get(category) ?? []}
            onClick={() => open(category)}
          />
        ))}
      </div>
    );
  }

  // Arrived via a specific shared link: that category is the hero, given
  // the same weight as a single product page (big cover image, its own
  // full product grid), not a cramped back-link-and-thumbnail treatment.
  // Every other category follows below — "Explore More", exactly like a
  // product page's own footer section — so a client isn't walled into
  // only what was sent them.
  const heroProducts = byCategory.get(active) ?? [];
  const realCount = heroProducts.filter((p) => !p.placeholder).length;
  const cover = heroProducts[0];
  const otherCategories = categories.filter((c) => c !== active);

  return (
    <div>
      <section className="mb-16">
        <p className="font-sans-ui mb-3 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Catalogue Library
        </p>
        <h1 className="mb-4 text-3xl leading-tight sm:text-4xl">{active}</h1>
        <p className="mb-8 max-w-xl text-[var(--ink)]/70">
          {realCount > 0
            ? `${realCount} handcrafted piece${realCount === 1 ? "" : "s"} from the studio's ${active} range.`
            : "More pieces from this category are on their way."}
        </p>

        {cover && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            <Image
              src={cover.image}
              alt={active}
              width={1200}
              height={1200}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}

        {heroProducts.length > 1 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {heroProducts.map((product) => (
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
                <p className="font-sans-ui truncate text-xs text-[var(--ink)]/80">{product.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="font-sans-ui mb-6 flex items-baseline justify-between">
          <h2 className="text-lg">Explore More From Our Collection</h2>
          <button onClick={clear} className="text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]">
            View all catalogues →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {otherCategories.map((category) => (
            <CategoryTile
              key={category}
              category={category}
              products={byCategory.get(category) ?? []}
              onClick={() => open(category)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
