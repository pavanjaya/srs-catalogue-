import Image from "next/image";
import Link from "next/link";
import { studio } from "@/lib/studio";
import { getBrochures } from "@/lib/brochures";
import { BrochureManager } from "@/components/BrochureManager";
import { LogoutButton } from "@/components/LogoutButton";

// Always fresh — the admin dashboard needs to show the current brochure
// state immediately after an upload, not a stale cached snapshot.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const brochures = await getBrochures();

  return (
    <>
      <div className="font-sans-ui sticky top-0 z-40 flex items-center justify-between bg-[var(--ink)] px-6 py-3 text-sm text-white">
        <span className="flex items-center gap-2 tracking-[0.15em] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Studio
        </span>
        <div className="flex items-center gap-5">
          <Link
            href={studio.website}
            target="_blank"
            className="text-white/70 hover:text-white"
          >
            Visit full website ↗
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
        <header className="mb-10">
          <Image
            src="/brand/srs-logo.png"
            alt={studio.name}
            width={1488}
            height={366}
            priority
            unoptimized
            className="mb-6 h-9 w-auto sm:h-10"
          />
          <p className="font-sans-ui mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Catalogue Library
          </p>
          <h1 className="mb-3 max-w-xl text-2xl leading-tight sm:text-3xl">
            Where every catalogue lives.
          </h1>
          <p className="font-sans-ui max-w-md text-[var(--ink)]/70">
            Upload a brochure once — its link stays exactly as shared, ready whenever a client
            asks.
          </p>
        </header>

        <BrochureManager initialBrochures={brochures} />
      </div>
    </>
  );
}
