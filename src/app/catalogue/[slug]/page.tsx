import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProducts, getOtherProducts, getProductBySlug } from "@/lib/products";
import { studio } from "@/lib/studio";
import { SiteHeader } from "@/components/SiteHeader";

export async function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const description = `${product.shortDescription} View the full catalogue — materials, dimensions and finishes.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [{ url: product.image }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [product.image],
    },
  };
}

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const otherProducts = getOtherProducts(slug, 12);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SiteHeader />

      <section className="mb-12">
        <p className="font-sans-ui mb-3 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          {product.category}
        </p>
        <h1 className="mb-4 text-3xl leading-tight sm:text-4xl">{product.name}</h1>
        <p className="mb-8 max-w-xl text-[var(--ink)]/70">{product.shortDescription}</p>

        <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <Image
            src={product.image}
            alt={product.name}
            width={1200}
            height={1200}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        <div className="font-sans-ui flex flex-wrap gap-3">
          <a
            href={product.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
          >
            View / Download Catalogue (PDF)
          </a>
        </div>
      </section>

      <section>
        <div className="font-sans-ui mb-6 flex items-baseline justify-between">
          <h2 className="text-lg">Explore More From Our Collection</h2>
          <Link href="/catalogues" className="text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]">
            View all catalogues →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {otherProducts.map((other) => (
            <Link
              key={other.slug}
              href={`/catalogue/${other.slug}`}
              className="group block"
            >
              <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                <Image
                  src={other.image}
                  alt={other.name}
                  width={400}
                  height={400}
                  className="h-auto w-full object-cover transition group-hover:opacity-80"
                />
              </div>
              <p className="font-sans-ui text-xs text-[var(--ink)]/80">{other.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="font-sans-ui mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--line)] pt-6 text-sm text-[var(--ink)]/60">
        <a href={`tel:${studio.phone}`} className="hover:text-[var(--ink)]">
          Call
        </a>
        <a
          href={`https://wa.me/${studio.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--ink)]"
        >
          WhatsApp
        </a>
        <a href={`mailto:${studio.email}`} className="hover:text-[var(--ink)]">
          Email
        </a>
        <a
          href={studio.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--ink)]"
        >
          Instagram
        </a>
      </footer>
    </div>
  );
}
