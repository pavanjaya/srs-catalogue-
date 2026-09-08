import Image from "next/image";
import Link from "next/link";
import { getProductsByCategory, productCategories } from "@/lib/products";
import { studio } from "@/lib/studio";
import { getCategoryBrochures } from "@/lib/brochures";
import { AdminCategoryBrowser } from "@/components/AdminCategoryBrowser";
import { BrochureManager } from "@/components/BrochureManager";
import { logout } from "./actions";

// Always fresh — the admin dashboard needs to show the current brochure
// state immediately after an upload, not a stale cached snapshot.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const byCategory = getProductsByCategory();
  const brochures = await getCategoryBrochures(productCategories);

  return (
    <>
      <div className="font-sans-ui sticky top-0 z-40 flex items-center justify-between bg-[var(--ink)] px-6 py-3 text-sm text-white">
        <span className="flex items-center gap-2 tracking-[0.15em] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Admin Mode
        </span>
        <div className="flex items-center gap-5">
          <Link
            href="/catalogues"
            target="_blank"
            className="text-white/70 hover:text-white"
          >
            View public homepage ↗
          </Link>
          <form action={logout}>
            <button type="submit" className="text-white/70 hover:text-white">
              Log out
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <header className="mb-12">
          <Image
            src="/brand/srs-logo.png"
            alt={studio.name}
            width={1488}
            height={366}
            priority
            unoptimized
            className="mb-6 h-10 w-auto sm:h-12"
          />
          <p className="font-sans-ui max-w-xl text-[var(--ink)]/70">
            Every piece carries its own story, and its own catalogue. Open one
            below, or share its link — it arrives exactly as itself.
          </p>
        </header>

        <BrochureManager categories={productCategories} brochures={brochures} />

        <AdminCategoryBrowser categories={productCategories} byCategory={byCategory} brochures={brochures} />
      </div>
    </>
  );
}
