"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { buildThumbnailPathname } from "@/lib/brochures";

// Deleting sends no file body, so it stays a normal Server Action — only
// uploads need the client-upload route (src/app/api/brochures/upload),
// since Vercel's 4.5MB request-body limit can't be raised.
export async function deleteBrochure(pdfPathname: string, id: string): Promise<void> {
  if (!pdfPathname.startsWith("brochures/")) {
    throw new Error("Invalid brochure.");
  }
  // del() doesn't error when a path doesn't exist, so it's safe to always
  // try the thumbnail too even for brochures that never got one.
  await Promise.all([del(pdfPathname), del(buildThumbnailPathname(id))]);
  revalidatePath("/");
}
