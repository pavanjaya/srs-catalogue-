"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { logout } from "@/app/actions";

// "Log out" in the top bar — a click no longer logs out immediately;
// it opens a small reconfirm popover first, so it can't happen by
// accident from a stray click.
export function LogoutButton() {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!confirming) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setConfirming(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirming(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [confirming]);

  function confirmLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setConfirming((v) => !v)}
        className="text-white/70 transition hover:text-white"
      >
        Log out
      </button>

      {confirming && (
        <div className="font-sans-ui absolute top-full right-0 z-50 mt-3 w-60 rounded-xl border border-white/10 bg-[#141414] p-4 text-left shadow-2xl">
          <p className="mb-3 text-xs leading-relaxed text-white/70">Log out of the studio?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="flex-1 rounded-full border border-white/15 px-3 py-2 text-xs text-white/80 transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              disabled={isPending}
              className="flex-1 rounded-full bg-white px-3 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--accent)] disabled:opacity-50"
            >
              {isPending ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
