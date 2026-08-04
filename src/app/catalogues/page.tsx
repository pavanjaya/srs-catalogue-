import Image from "next/image";
import Link from "next/link";
import { getProductsByCategory } from "@/lib/products";
import { studio } from "@/lib/studio";

export default function CataloguesPage() {
  const byCategory = getProductsByCategory();

  return (
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
        <h1 className="sr-only">{studio.name}</h1>
        <p className="font-sans-ui mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Catalogue Library
        </p>
        <p className="font-sans-ui max-w-xl text-[var(--ink)]/70">
          Every piece carries its own story, and its own catalogue. Open one
          below, or share its link — it arrives exactly as itself.
        </p>
        <a
          href={studio.website}
          target="_blank"
          rel="noopener noreferrer"
          className="font-sans-ui mt-4 inline-block text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]"
        >
          Visit full website ↗
        </a>
      </header>

      {[...byCategory.entries()].map(([category, products]) => (
        <section key={category} className="mb-14">
          <h2 className="font-sans-ui mb-6 text-lg">{category}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/catalogue/${product.slug}`}
                className="group block"
              >
                <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-auto w-full object-cover transition group-hover:opacity-80"
                  />
                </div>
                <p className="font-sans-ui text-xs text-[var(--ink)]/80">
                  {product.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <footer className="font-sans-ui flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--line)] pt-6 text-sm text-[var(--ink)]/60">
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
