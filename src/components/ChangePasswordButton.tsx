"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changePassword, type ChangePasswordState } from "@/app/actions";

const initialState: ChangePasswordState = {};

// "Change password" in the top bar, next to Log out — lets the studio
// update their own login password without calling a developer to edit it.
// Same confirm-popover pattern as LogoutButton, but holding a small form
// instead of a single confirm/cancel pair.
export function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(changePassword, initialState);
  const wrapRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-medium text-white/70 transition hover:text-white"
      >
        Change password
      </button>

      {open && (
        <div className="font-sans-ui absolute top-full right-0 z-50 mt-3 w-72 rounded-xl border border-white/10 bg-[#141414] p-4 text-left shadow-2xl">
          {state.success ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-[var(--accent)]">
                Password updated. Use it next time you log in.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Done
              </button>
            </>
          ) : (
            <form ref={formRef} action={formAction} className="flex flex-col gap-2.5">
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/30"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/30"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-white/30"
              />

              {state.error && <p className="text-xs text-red-400">{state.error}</p>}

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="flex-1 rounded-full border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--accent)] disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
