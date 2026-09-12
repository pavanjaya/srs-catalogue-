import Image from "next/image";
import Link from "next/link";
import { studio } from "@/lib/studio";
import { verifyResetToken } from "@/lib/passwordReset";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const valid = await verifyResetToken(token);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[url('/brand/login-bg.jpg')] bg-cover bg-center px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/45" />

      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--paper)] p-8 shadow-2xl">
        <Image
          src="/brand/srs-logo.png"
          alt={studio.name}
          width={1488}
          height={366}
          unoptimized
          priority
          className="mb-8 h-9 w-auto"
        />
        <p className="font-sans-ui mb-6 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Reset Password
        </p>

        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <>
            <p className="font-sans-ui mb-6 text-sm leading-relaxed text-[var(--ink)]/70">
              This reset link is invalid or has expired. Request a new one
              from the login page.
            </p>
            <Link
              href="/forgot-password"
              className="font-sans-ui block w-full rounded-full bg-[var(--ink)] px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
            >
              Request new link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
