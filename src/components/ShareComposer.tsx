"use client";

import { useState } from "react";

// Reusable "compose & send" popup — used for sharing a single product's
// link and for sharing a whole category's link. `messageTemplate` may
// contain a literal "{url}" placeholder, filled in client-side (only the
// browser knows its own origin, so the full URL can't be built server-side
// in the admin page and passed down as a prop).
export function ShareComposer({
  triggerLabel = "Share",
  dialogTitle,
  path,
  messageTemplate,
}: {
  triggerLabel?: string;
  dialogTitle: string;
  path: string;
  messageTemplate: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  function handleOpen() {
    const url = `${window.location.origin}${path}`;
    setMessage(messageTemplate.replace("{url}", url));
    setOpen(true);
  }

  function handleSend() {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="font-sans-ui shrink-0 text-xs text-[var(--ink)]/60 underline-offset-2 hover:text-[var(--ink)] hover:underline"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--paper)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-sans-ui mb-1 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
              Share on WhatsApp
            </p>
            <h2 className="mb-4 text-xl">{dialogTitle}</h2>

            <label
              htmlFor="share-message"
              className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase"
            >
              Message
            </label>
            <textarea
              id="share-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="font-sans-ui mb-4 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
            />

            <div className="font-sans-ui flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
