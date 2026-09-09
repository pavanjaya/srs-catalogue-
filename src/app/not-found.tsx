import Image from "next/image";
import Link from "next/link";
import { studio } from "@/lib/studio";

// Next's default 404 is plain black-on-white with no branding — a client
// clicking a stale or mistyped brochure link would land on it. This gives
// them the same visual language as everywhere else in the app.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <Image
        src="/brand/srs-logo.png"
        alt={studio.name}
        width={1488}
        height={366}
        unoptimized
        priority
        className="mb-10 h-9 w-auto"
      />
      <p className="font-sans-ui mb-3 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Not Found
      </p>
      <h1 className="mb-4 text-2xl leading-tight">
        This catalogue isn&apos;t here anymore.
      </h1>
      <p className="font-sans-ui mb-8 text-sm text-[var(--ink)]/60">
        The link may be out of date. Reach out and we&apos;ll send the current one.
      </p>
      <Link
        href={studio.website}
        target="_blank"
        className="shadow-btn font-sans-ui rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-[var(--ink)] active:translate-y-0"
      >
        Visit full website ↗
      </Link>
    </div>
  );
}
