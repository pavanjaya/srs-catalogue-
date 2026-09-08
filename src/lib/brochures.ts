import { list } from "@vercel/blob";

// Server-only: reads BLOB_READ_WRITE_TOKEN, so this must only ever be
// imported from Server Components / Server Actions / Route Handlers,
// never a "use client" file.

// Freeform brochures — no fixed category list, no database. Each PDF is
// stored at brochures/<id>--<encodeURIComponent(title)>.pdf; the id gives
// a stable public URL and delete target, the title is carried in the
// pathname itself since there's nowhere else to keep it. The blob store's
// own listing is the entire source of truth.
export type Brochure = {
  id: string;
  title: string;
  url: string;
  uploadedAt: string; // ISO
};

const PATHNAME_RE = /^brochures\/([a-zA-Z0-9_-]+)--(.+)\.pdf$/;

export function buildBrochurePathname(id: string, title: string): string {
  return `brochures/${id}--${encodeURIComponent(title)}.pdf`;
}

function parsePathname(pathname: string): { id: string; title: string } | null {
  const match = pathname.match(PATHNAME_RE);
  if (!match) return null;
  try {
    return { id: match[1], title: decodeURIComponent(match[2]) };
  } catch {
    return null;
  }
}

export async function getBrochures(): Promise<Brochure[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
  const { blobs } = await list({ prefix: "brochures/", limit: 1000 });
  const brochures: Brochure[] = [];
  for (const blob of blobs) {
    const parsed = parsePathname(blob.pathname);
    if (!parsed) continue;
    brochures.push({
      id: parsed.id,
      title: parsed.title,
      url: blob.url,
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
