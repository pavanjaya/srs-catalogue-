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
export type Brochure = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string; // ISO
};

const PDF_RE = /^brochures\/([a-zA-Z0-9_-]+)--(.+)\.pdf$/;
const THUMB_RE = /^brochure-thumbs\/([a-zA-Z0-9_-]+)\.png$/;

export function buildBrochurePathname(id: string, title: string): string {
  return `brochures/${id}--${encodeURIComponent(title)}.pdf`;
}

export function buildThumbnailPathname(id: string): string {
  return `brochure-thumbs/${id}.png`;
}

export async function getBrochures(): Promise<Brochure[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const [pdfList, thumbList] = await Promise.all([
    list({ prefix: "brochures/", limit: 1000 }),
    list({ prefix: "brochure-thumbs/", limit: 1000 }),
  ]);

  const thumbById = new Map<string, string>();
  for (const blob of thumbList.blobs) {
    const match = blob.pathname.match(THUMB_RE);
    if (match) thumbById.set(match[1], blob.url);
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
