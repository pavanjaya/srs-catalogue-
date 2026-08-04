import Image from "next/image";
import Link from "next/link";
import { getProductsByCategory } from "@/lib/products";
import { studio } from "@/lib/studio";
import { ShareComposer } from "./ShareComposer";
import { logout } from "./actions";

export default function AdminPage() {
  const byCategory = getProductsByCategory();
  const pin = process.env.SITE_PASSWORD;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <header className="font-sans-ui mb-12 flex items-center justify-between">
        <Image
          src="/brand/srs-logo.png"
          alt={studio.name}
          width={1488}
          height={366}
          unoptimized
          priority
          className="h-9 w-auto sm:h-10"
        />
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]"
          >
            Log out
          </button>
        </form>
      </header>

      <p className="font-sans-ui mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Admin
      </p>
      <h1 className="mb-10 text-3xl">Share a Catalogue</h1>

      {[...byCategory.entries()].map(([category, products]) => (
        <section key={category} className="mb-12">
          <h2 className="font-sans-ui mb-4 text-lg">{category}</h2>
          <div className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white">
            {products.map((product) => (
              <div
                key={product.slug}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate">{product.name}</p>
                  <Link
                    href={`/catalogue/${product.slug}`}
                    target="_blank"
                    className="font-sans-ui text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]"
                  >
                    View public page ↗
                  </Link>
                </div>
                <ShareComposer product={product} pin={pin} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
