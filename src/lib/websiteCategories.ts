import "server-only";
import { studio } from "./studio";

// The live source of truth is the main website's own /api/categories
// (which just reflects its productCategories list) — so adding, renaming,
// or removing a category there shows up here automatically within the
// hour, no redeploy of this project needed. This fallback snapshot only
// kicks in if that fetch ever fails (site down, network hiccup), so a
// stale category picker beats a broken one.
const FALLBACK_CATEGORIES = [
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
];

export async function getWebsiteCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${studio.website}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_CATEGORIES;
    const data = await res.json();
    if (!Array.isArray(data.categories) || data.categories.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return data.categories;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
