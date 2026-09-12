"use client";

import { useState, useTransition } from "react";
import { requestPasswordReset } from "./actions";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="font-sans-ui rounded-lg bg-[var(--footer-bg)] px-4 py-3 text-sm text-[var(--ink)]">
        If that email is configured, a reset link is on its way. It's valid
        for 30 minutes.
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await requestPasswordReset();
          setSent(true);
        })
      }
      className="font-sans-ui w-full rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-50"
    >
      {isPending ? "Sending…" : "Send reset link"}
    </button>
  );
}
