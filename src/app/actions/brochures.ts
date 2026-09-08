"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

// Deleting sends no file body, so it stays a normal Server Action — only
// uploads need the client-upload route (src/app/api/brochures/upload),
// since Vercel's 4.5MB request-body limit can't be raised.
export async function deleteBrochure(pathname: string): Promise<void> {
  if (!pathname.startsWith("brochures/")) {
    throw new Error("Invalid brochure.");
  }
  await del(pathname);
  revalidatePath("/");
}
