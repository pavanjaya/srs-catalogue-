import Image from "next/image";
import Link from "next/link";
import { getProductsByCategory } from "@/lib/products";
import { studio } from "@/lib/studio";
import { ShareComposer } from "@/components/ShareComposer";
import { logout } from "./actions";

export default function AdminPage() {
  const byCategory = getProductsByCategory();
  const pin = process.env.SITE_PASSWORD;

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

      {[...byCategory.entries()].map(([category, products]) => (
        <section key={category} className="mb-14">
          <h2 className="font-sans-ui mb-6 text-lg">{category}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <div key={product.slug} className="group">
                <Link href={`/catalogue/${product.slug}`} target="_blank" className="block">
                  <div className="mb-2 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-auto w-full object-cover transition group-hover:opacity-80"
                    />
                  </div>
                </Link>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-sans-ui truncate text-xs text-[var(--ink)]/80">
                    {product.name}
                  </p>
                  <ShareComposer product={product} pin={pin} />
                </div>
              </div>
            ))}
          </div>
        </section>
        ))}
      </div>
    </>
  );
}
