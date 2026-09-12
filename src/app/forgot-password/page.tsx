import Image from "next/image";
import Link from "next/link";
import { studio } from "@/lib/studio";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

// Masks everything but the first character and the domain, so the page can
// reassure whoever's looking ("yes, this is going to the right inbox")
// without fully exposing the address — this page is reachable by anyone
// who finds the login screen, logged in or not.
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${"•".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

export default function ForgotPasswordPage() {
  const recoveryEmail = process.env.PASSWORD_RECOVERY_EMAIL;

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
        <p className="font-sans-ui mb-2 flex items-center gap-2 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Forgot Password
        </p>
        <p className="font-sans-ui mb-6 text-sm leading-relaxed text-[var(--ink)]/70">
          {recoveryEmail
            ? `We'll send a reset link to ${maskEmail(recoveryEmail)}.`
            : "We'll send a reset link to the studio's recovery email."}
        </p>

        <ForgotPasswordForm />

        <Link
          href="/login"
          className="font-sans-ui mt-5 block text-center text-xs text-[var(--ink)]/50 hover:text-[var(--ink)]"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
