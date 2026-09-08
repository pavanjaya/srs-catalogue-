// Pure — safe to import from both server and client code (unlike
// src/lib/brochures.ts, which pulls in the Blob SDK's server-only list()).
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
