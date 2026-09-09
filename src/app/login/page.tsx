import Image from "next/image";
import { studio } from "@/lib/studio";
import { adminLogin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/", error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6">
      <Image
        src="/brand/srs-logo.png"
        alt={studio.name}
        width={1488}
        height={366}
        unoptimized
        priority
        className="mb-10 h-10 w-auto"
      />
      <p className="font-sans-ui mb-6 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Studio
      </p>
      <form action={adminLogin} className="shadow-card w-full rounded-2xl bg-white p-6">
        <input type="hidden" name="next" value={next} />
        <label
          htmlFor="password"
          className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoFocus
          className="font-sans-ui mb-4 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition-shadow focus:border-[var(--ink)]/30 focus:shadow-[0_0_0_3px_rgba(255,173,33,0.18)]"
        />
        {error && (
          <p className="font-sans-ui mb-4 text-sm text-red-800">
            Incorrect password — please try again.
          </p>
        )}
        <button
          type="submit"
          className="shadow-btn font-sans-ui w-full rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent)] hover:text-[var(--ink)] active:translate-y-0"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
