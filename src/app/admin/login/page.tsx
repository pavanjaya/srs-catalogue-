import Image from "next/image";
import { studio } from "@/lib/studio";
import { adminLogin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/admin", error } = await searchParams;

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
      <p className="font-sans-ui mb-6 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
        Admin
      </p>
      <form action={adminLogin} className="w-full">
        <input type="hidden" name="next" value={next} />
        <label
          htmlFor="password"
          className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase"
        >
          Admin Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoFocus
          className="font-sans-ui mb-4 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
        />
        {error && (
          <p className="font-sans-ui mb-4 text-sm text-red-800">
            Incorrect password — please try again.
          </p>
        )}
        <button
          type="submit"
          className="font-sans-ui w-full rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
