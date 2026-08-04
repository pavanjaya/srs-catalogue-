import Image from "next/image";
import Link from "next/link";
import { studio } from "@/lib/studio";

export function SiteHeader() {
  return (
    <header className="font-sans-ui mb-10 flex items-center justify-between">
      <Link href="/" className="block">
        <Image
          src="/brand/srs-logo.png"
          alt={studio.name}
          width={1488}
          height={366}
          priority
          unoptimized
          className="h-9 w-auto sm:h-10"
        />
      </Link>
      <a
        href={studio.website}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[var(--ink)]/60 hover:text-[var(--ink)]"
      >
        Visit full website ↗
      </a>
    </header>
  );
}
