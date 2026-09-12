"use server";

import { del, list, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import {
  buildThumbnailPathname,
  buildTagsPathname,
  buildWebsiteLinkPathname,
  buildTypePathname,
  normalizeTags,
  isCatalogueType,
  TAGS_PREFIX,
  CATEGORY_PREFIX,
  TYPE_PREFIX,
  type CatalogueType,
} from "@/lib/brochures";
import { getWebsiteLinkOptions } from "@/lib/websiteCategories";
import { parseWebsiteLinkSelection, type WebsiteLink } from "@/lib/websiteLink";

// Deleting sends no file body, so it stays a normal Server Action — only
// uploads need the client-upload route (src/app/api/brochures/upload),
// since Vercel's 4.5MB request-body limit can't be raised.
export async function deleteBrochure(pdfPathname: string, id: string): Promise<void> {
  if (!pdfPathname.startsWith("brochures/")) {
    throw new Error("Invalid brochure.");
  }
  // del() doesn't error when a path doesn't exist, so it's safe to always
  // try the thumbnail (and any tags/category/type blob) too even for
  // brochures that never got one.
  const [existingTags, existingCategory, existingType] = await Promise.all([
    list({ prefix: `${TAGS_PREFIX}${id}--` }),
    list({ prefix: `${CATEGORY_PREFIX}${id}--` }),
    list({ prefix: `${TYPE_PREFIX}${id}--` }),
  ]);
  await Promise.all([
    del(pdfPathname),
    del(buildThumbnailPathname(id)),
    ...existingTags.blobs.map((b) => del(b.pathname)),
    ...existingCategory.blobs.map((b) => del(b.pathname)),
    ...existingType.blobs.map((b) => del(b.pathname)),
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

// Same pathname-encoding pattern as tags, but single-valued — pass ""
// to clear it. `rawSelection` is the <select>'s own "type|value" string;
// it's re-resolved against the live category/story list here rather than
// trusting whatever label the client sent, so a stale option can't get
// saved with the wrong display text.
export async function updateBrochureWebsiteLink(id: string, rawSelection: string): Promise<WebsiteLink | null> {
  const options = await getWebsiteLinkOptions();
  const link = parseWebsiteLinkSelection(rawSelection, options);

  const existing = await list({ prefix: `${CATEGORY_PREFIX}${id}--` });
  await Promise.all(existing.blobs.map((b) => del(b.pathname)));

  if (link) {
    await put(buildWebsiteLinkPathname(id, link), JSON.stringify(link), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
  }

  revalidatePath("/");
  revalidatePath(`/brochure/${id}`);
  return link;
}

// The admin library's own Product/Story/General split — always exactly
// one value, unlike tags or the website link. Same delete-then-write
// pathname pattern; falls back to "general" for anything invalid so this
// can never leave a brochure without a type.
export async function updateBrochureType(id: string, rawType: string): Promise<CatalogueType> {
  const type: CatalogueType = isCatalogueType(rawType) ? rawType : "general";

  const existing = await list({ prefix: `${TYPE_PREFIX}${id}--` });
  await Promise.all(existing.blobs.map((b) => del(b.pathname)));

  await put(buildTypePathname(id, type), JSON.stringify({ type }), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  revalidatePath("/");
  return type;
}
