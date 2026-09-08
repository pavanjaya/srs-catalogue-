import { list } from "@vercel/blob";
import type { ProductCategory } from "@/lib/products";

// Server-only: reads BLOB_READ_WRITE_TOKEN, so this must only ever be
// imported from Server Components / Server Actions, never a "use client" file.

// One real, designed PDF brochure per category, stored in Vercel Blob under
// brochures/<category-slug>.pdf — no database: the blob store's own listing
// is the source of truth for "does this category have a brochure, and what's
// its current URL." Uploading again at the same slug (see actions/brochures.ts)
// overwrites it, so there's never more than one live brochure per category.
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// category -> live brochure URL, only for categories that actually have one.
export async function getCategoryBrochures(
  categories: readonly ProductCategory[],
): Promise<Partial<Record<ProductCategory, string>>> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return {};
  const { blobs } = await list({ prefix: "brochures/", limit: 1000 });
  const urlBySlug = new Map(
    blobs.map((b) => [b.pathname.replace(/^brochures\//, "").replace(/\.pdf$/, ""), b.url]),
  );
  const result: Partial<Record<ProductCategory, string>> = {};
  for (const category of categories) {
    const url = urlBySlug.get(categorySlug(category));
    if (url) result[category] = url;
  }
  return result;
}
