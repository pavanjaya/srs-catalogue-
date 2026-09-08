import Image from "next/image";
import { Suspense } from "react";
import { getProductsByCategory, productCategories } from "@/lib/products";
import { studio } from "@/lib/studio";
import { getCategoryBrochures } from "@/lib/brochures";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { FloatingContact } from "@/components/FloatingContact";

export default async function CataloguesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const byCategory = getProductsByCategory();
  const brochures = await getCategoryBrochures(productCategories);
  // The category-hero view (CategoryBrowser, below) has its own eyebrow,
  // heading and description once a category is selected — showing this
  // generic intro above it as well just repeats "Catalogue Library" twice.
  const { category } = await searchParams;
  const hasActiveCategory = !!category && productCategories.includes(category as (typeof productCategories)[number]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <header className="mb-10">
        <Image
          src="/brand/srs-logo.png"
          alt={studio.name}
          width={1488}
          height={366}
          priority
          unoptimized
          className="mb-6 h-10 w-auto sm:h-12"
        />
        <h1 className="sr-only">{studio.name}</h1>
        {!hasActiveCategory && (
          <>
            <p className="font-sans-ui mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Catalogue Library
            </p>
            <p className="font-sans-ui max-w-xl text-[var(--ink)]/70">
              Every piece carries its own story, and its own catalogue.
              Browse by type below, open one, or share its link — it arrives
              exactly as itself.
            </p>
          </>
        )}
        <a
          href={studio.website}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans-ui mt-4 inline-block text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]"
        >
          Visit full website ↗
        </a>
      </header>

      <Suspense fallback={null}>
        <CategoryBrowser
          categories={productCategories}
          byCategory={byCategory}
          brochures={brochures}
          linkPrefix="/catalogue"
        />
      </Suspense>

      <FloatingContact />
    </div>
  );
}
