import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBrochureById, getBrochures } from "@/lib/brochures";
import { studio } from "@/lib/studio";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingContact } from "@/components/FloatingContact";
import { PdfIcon } from "@/components/BrochureManager";

// Always fresh — a brochure can be replaced or removed from the admin
// panel at any time, and this page shouldn't serve a stale cached link.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const brochure = await getBrochureById(id);
  if (!brochure) return {};

  const description = `The full ${brochure.title} catalogue from ${studio.name} — view or download the PDF.`;

  return {
    title: brochure.title,
    description,
    openGraph: {
      title: brochure.title,
      description,
      type: "website",
      images: brochure.thumbnailUrl ? [{ url: brochure.thumbnailUrl }] : undefined,
    },
    twitter: {
      card: brochure.thumbnailUrl ? "summary_large_image" : "summary",
      title: brochure.title,
      description,
      images: brochure.thumbnailUrl ? [brochure.thumbnailUrl] : undefined,
    },
  };
}

export default async function BrochurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [brochure, all] = await Promise.all([getBrochureById(id), getBrochures()]);
  if (!brochure) notFound();

  const others = all.filter((b) => b.id !== id).slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SiteHeader />

      <section className="mb-16">
        <p className="font-sans-ui mb-3 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Catalogue Library
        </p>
        <h1 className="mb-4 text-3xl leading-tight sm:text-4xl">{brochure.title}</h1>
        <p className="mb-8 max-w-xl text-[var(--ink)]/70">
          The full {brochure.title} catalogue — view or download below.
        </p>

        {brochure.thumbnailUrl && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            <Image
              src={brochure.thumbnailUrl}
              alt={brochure.title}
              width={1200}
              height={1200}
              unoptimized
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        )}

        <a
          href={brochure.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans-ui inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
        >
          View / Download Catalogue (PDF)
        </a>
      </section>

      {others.length > 0 && (
        <section>
          <div className="font-sans-ui mb-6 flex items-baseline justify-between">
            <h2 className="text-lg">Explore More From Our Collection</h2>
            <Link href="/catalogues" className="text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]">
              View all catalogues →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {others.map((other) => (
              <Link key={other.id} href={`/brochure/${other.id}`} className="group block">
                <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  {other.thumbnailUrl ? (
                    <Image
                      src={other.thumbnailUrl}
                      alt={other.title}
                      width={400}
                      height={400}
                      unoptimized
                      className="h-full w-full object-cover transition group-hover:opacity-80"
                    />
                  ) : (
                    <PdfIcon className="h-10 w-10 text-[var(--line)]" />
                  )}
                </div>
                <p className="font-sans-ui truncate text-sm text-[var(--ink)]">{other.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FloatingContact />
    </div>
  );
}
