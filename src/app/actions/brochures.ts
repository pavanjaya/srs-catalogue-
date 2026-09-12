"use server";

import { del, list, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { buildThumbnailPathname, buildTagsPathname, normalizeTags, TAGS_PREFIX } from "@/lib/brochures";

// Deleting sends no file body, so it stays a normal Server Action — only
// uploads need the client-upload route (src/app/api/brochures/upload),
// since Vercel's 4.5MB request-body limit can't be raised.
export async function deleteBrochure(pdfPathname: string, id: string): Promise<void> {
  if (!pdfPathname.startsWith("brochures/")) {
    throw new Error("Invalid brochure.");
  }
  // del() doesn't error when a path doesn't exist, so it's safe to always
  // try the thumbnail (and any tags blob) too even for brochures that
  // never got one.
  const existingTags = await list({ prefix: `${TAGS_PREFIX}${id}--` });
  await Promise.all([
    del(pdfPathname),
    del(buildThumbnailPathname(id)),
    ...existingTags.blobs.map((b) => del(b.pathname)),
  ]);
  revalidatePath("/");
}

// Tags live in the tags blob's own pathname (see lib/brochures.ts), so
// "changing" them means deleting whatever pathname is there now and
// writing a new one — there's no in-place update of blob content.
export async function updateBrochureTags(id: string, rawTags: string[]): Promise<string[]> {
  const tags = normalizeTags(rawTags);

  const existing = await list({ prefix: `${TAGS_PREFIX}${id}--` });
  await Promise.all(existing.blobs.map((b) => del(b.pathname)));

  if (tags.length > 0) {
    await put(buildTagsPathname(id, tags), JSON.stringify({ tags }), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
  }

  revalidatePath("/");
  revalidatePath(`/brochure/${id}`);
  return tags;
}
