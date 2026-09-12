import { notFound } from "next/navigation";
import { getBrochureById, getBrochures } from "@/lib/brochures";
import { getWebsiteLinkOptions } from "@/lib/websiteCategories";
import { BrochureSharePage } from "@/components/BrochureSharePage";

// Admin-only by default — this path isn't in proxy.ts's public/client
// allowlists, so it falls through to the same session check as "/".
export const dynamic = "force-dynamic";

export default async function LibraryBrochurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [brochure, all, websiteLinkOptions] = await Promise.all([
    getBrochureById(id),
    getBrochures(),
    getWebsiteLinkOptions(),
  ]);
  if (!brochure) notFound();

  const allTags = Array.from(new Set(all.flatMap((b) => b.tags))).sort((a, b) => a.localeCompare(b));

  return <BrochureSharePage brochure={brochure} allTags={allTags} websiteLinkOptions={websiteLinkOptions} />;
}
