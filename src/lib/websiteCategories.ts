import "server-only";
import { studio } from "./studio";
import type { WebsiteLinkOptions } from "./websiteLink";

// The live source of truth is the main website's own /api/categories
// (which reflects its productCategories and collections lists) — so
// adding, renaming, or removing either there shows up here automatically
// within the hour, no redeploy of this project needed. This fallback
// snapshot only kicks in if that fetch ever fails (site down, network
// hiccup), so a stale picker beats a broken one.
const FALLBACK: WebsiteLinkOptions = {
  categories: [
    "Wall Sconces",
    "Wall Art",
    "Wall Clock",
    "Pendant Lights",
    "Ceiling Lights",
    "Table Lights",
    "Floor Lamps",
    "Accent Furniture Pieces",
    "Artisanal Pieces",
    "Mirror",
  ],
  stories: [
    { slug: "panch-bhuta", title: "Panch Bhuta" },
    { slug: "kabir-ke-dohe", title: "Kabir Ke Dohe" },
    { slug: "aranya", title: "Aranya" },
    { slug: "sama-yantar", title: "Sama:Yantar" },
    { slug: "parth-sarathi", title: "Parth:Sarathi" },
    { slug: "prem-samatva", title: "Prem:Samatva" },
  ],
};

export async function getWebsiteLinkOptions(): Promise<WebsiteLinkOptions> {
  try {
    const res = await fetch(`${studio.website}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    const categories = Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : FALLBACK.categories;
    const stories = Array.isArray(data.collections) && data.collections.length > 0 ? data.collections : FALLBACK.stories;
    return { categories, stories };
  } catch {
    return FALLBACK;
  }
}
