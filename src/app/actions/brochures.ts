"use server";

import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { categorySlug } from "@/lib/brochures";

// Admin-only actions (called from ShareModal, which only renders behind the
// admin password gate). Each category has at most one brochure — uploading
// again overwrites it at the same path, so old versions don't pile up.
export async function uploadCategoryBrochure(
  category: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF file first." };
  }
  if (file.type !== "application/pdf") {
    return { error: "That doesn't look like a PDF — please choose a .pdf file." };
  }

  const blob = await put(`brochures/${categorySlug(category)}.pdf`, file, {
    access: "public",
    allowOverwrite: true,
    contentType: "application/pdf",
  });

  revalidatePath("/catalogues");
  revalidatePath("/");
  return { url: blob.url };
}

export async function deleteCategoryBrochure(category: string): Promise<void> {
  await del(`brochures/${categorySlug(category)}.pdf`);
  revalidatePath("/catalogues");
  revalidatePath("/");
}
