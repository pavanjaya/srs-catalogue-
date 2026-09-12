import { notFound } from "next/navigation";
import { getBrochureById } from "@/lib/brochures";
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
  const brochure = await getBrochureById(id);
  if (!brochure) notFound();

  return <BrochureSharePage brochure={brochure} />;
}
