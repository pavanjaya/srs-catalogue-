import { list } from "@vercel/blob";

// Server-only: reads BLOB_READ_WRITE_TOKEN, so this must only ever be
// imported from Server Components / Server Actions / Route Handlers,
// never a "use client" file.

// Freeform brochures — no fixed category list, no database. Each PDF is
// stored at brochures/<id>--<encodeURIComponent(title)>.pdf and, when a
// thumbnail was generated, its cover-page PNG at brochure-thumbs/<id>.png.
// The id gives a stable public URL and delete target, the title is
// carried in the pathname itself since there's nowhere else to keep it.
// The blob store's own listing is the entire source of truth.
//
// Tags follow the same pathname-encoding trick, at
// brochure-tags/<id>--<encodeURIComponent(tags.join(","))>.json — so
// reading tags for every brochure costs one extra list() call, never a
// per-brochure fetch. Editing tags deletes the old pathname and writes a
// new one (see updateBrochureTags in app/actions/brochures.ts), since the
// tag list itself IS the pathname.
export type Brochure = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  websiteCategory: string | null;
  uploadedAt: string; // ISO
};

const PDF_RE = /^brochures\/([a-zA-Z0-9_-]+)--(.+)\.pdf$/;
const THUMB_RE = /^brochure-thumbs\/([a-zA-Z0-9_-]+)\.png$/;
const TAGS_RE = /^brochure-tags\/([a-zA-Z0-9_-]+)--(.*)\.json$/;
const CATEGORY_RE = /^brochure-category\/([a-zA-Z0-9_-]+)--(.*)\.json$/;

export const TAGS_PREFIX = "brochure-tags/";
export const CATEGORY_PREFIX = "brochure-category/";

export function buildBrochurePathname(id: string, title: string): string {
  return `brochures/${id}--${encodeURIComponent(title)}.pdf`;
}

export function buildThumbnailPathname(id: string): string {
  return `brochure-thumbs/${id}.png`;
}

export function buildTagsPathname(id: string, tags: string[]): string {
  return `${TAGS_PREFIX}${id}--${encodeURIComponent(tags.join(","))}.json`;
}

// The main website's matching /products category, e.g. "Table Lights" —
// stored the same pathname-encoding way as tags, but single-valued.
export function buildCategoryPathname(id: string, category: string): string {
  return `${CATEGORY_PREFIX}${id}--${encodeURIComponent(category)}.json`;
}

// Trims, drops empties, and dedupes case-insensitively (keeping the first
// casing seen) — used both here and in the client-side tag editor so a
// tag typed as "USA" and one typed as "usa" are treated as the same tag.
export function normalizeTags(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const trimmed = t.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

// Two brochures cross-sell each other in "Explore More" only if they
// share at least one tag — except untagged brochures, which still
// cross-sell freely among themselves (today's behavior, preserved until
// something is deliberately tagged). This is what stops a USA-priced
// brochure from ever surfacing an India-priced one, or vice versa, once
// each is tagged with its region.
export function shareTag(a: string[], b: string[]): boolean {
  if (a.length === 0 && b.length === 0) return true;
  return a.some((t) => b.includes(t));
}

export async function getBrochures(): Promise<Brochure[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const [pdfList, thumbList, tagsList, categoryList] = await Promise.all([
    list({ prefix: "brochures/", limit: 1000 }),
    list({ prefix: "brochure-thumbs/", limit: 1000 }),
    list({ prefix: TAGS_PREFIX, limit: 1000 }),
    list({ prefix: CATEGORY_PREFIX, limit: 1000 }),
  ]);

  const thumbById = new Map<string, string>();
  for (const blob of thumbList.blobs) {
    const match = blob.pathname.match(THUMB_RE);
    if (match) thumbById.set(match[1], blob.url);
  }

  const tagsById = new Map<string, string[]>();
  for (const blob of tagsList.blobs) {
    const match = blob.pathname.match(TAGS_RE);
    if (!match) continue;
    try {
      const decoded = decodeURIComponent(match[2]);
      tagsById.set(match[1], decoded ? decoded.split(",") : []);
    } catch {
      continue;
    }
  }

  const categoryById = new Map<string, string>();
  for (const blob of categoryList.blobs) {
    const match = blob.pathname.match(CATEGORY_RE);
    if (!match) continue;
    try {
      const decoded = decodeURIComponent(match[2]);
      if (decoded) categoryById.set(match[1], decoded);
    } catch {
      continue;
    }
  }

  const brochures: Brochure[] = [];
  for (const blob of pdfList.blobs) {
    const match = blob.pathname.match(PDF_RE);
    if (!match) continue;
    let title: string;
    try {
      title = decodeURIComponent(match[2]);
    } catch {
      continue;
    }
    brochures.push({
      id: match[1],
      title,
      url: blob.url,
      thumbnailUrl: thumbById.get(match[1]),
      tags: tagsById.get(match[1]) ?? [],
      websiteCategory: categoryById.get(match[1]) ?? null,
      uploadedAt: new Date(blob.uploadedAt).toISOString(),
    });
  }

  // Newest first.
  brochures.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  return brochures;
}

export async function getBrochureById(id: string): Promise<Brochure | null> {
  const all = await getBrochures();
  return all.find((b) => b.id === id) ?? null;
}
