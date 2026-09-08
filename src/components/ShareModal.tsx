"use client";

import { useEffect, useState, useTransition } from "react";
import { WhatsAppIcon, EmailIcon } from "@/components/ConnectIcons";
import { deleteBrochure } from "@/app/actions/brochures";
import { buildBrochurePathname, type Brochure } from "@/lib/brochures";

// The admin panel's share popup for one brochure — link, editable message,
// Send via WhatsApp / Email, and Remove. Opens from clicking a card in
// BrochureManager.
export function ShareModal({
  brochure,
  onClose,
  onDeleted,
}: {
  brochure: Brochure;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  useEffect(() => {
    const fullUrl = `${window.location.origin}/brochure/${brochure.id}`;
    setUrl(fullUrl);
    setMessage(
      `Hi, here's the catalogue for ${brochure.title} 👇\n${fullUrl}\nTake a look — view or download anytime.`,
    );
    setCopied(false);
  }, [brochure]);

  // Close on Escape, for anyone driving this with a keyboard.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function copyUrl() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function sendWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  function sendEmail() {
    window.open(
      `mailto:?subject=${encodeURIComponent(brochure.title)}&body=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  function remove() {
    if (!window.confirm(`Remove "${brochure.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteBrochure(buildBrochurePathname(brochure.id, brochure.title));
      onDeleted();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[var(--paper)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-sans-ui text-xs tracking-[0.2em] text-[var(--ash)] uppercase">Share</p>
            <h2 className="text-xl text-[var(--ink)]">{brochure.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-sans-ui shrink-0 text-lg text-[var(--ink)]/50 hover:text-[var(--ink)]"
          >
            ✕
          </button>
        </div>

        <label className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          Link
        </label>
        <div className="mb-5 flex items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="font-sans-ui w-0 flex-1 truncate rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--ink)]/70 outline-none"
          />
          <button
            onClick={copyUrl}
            className="font-sans-ui shrink-0 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--ink)] transition hover:border-[var(--ink)]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

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
          className="font-sans-ui mb-5 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
        />

        <div className="font-sans-ui mb-4 grid grid-cols-2 gap-3">
          <button
            onClick={sendWhatsApp}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            Send via WhatsApp
          </button>
          <button
            onClick={sendEmail}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
          >
            <EmailIcon className="h-4 w-4 shrink-0" />
            Send via Email
          </button>
        </div>

        <button
          onClick={remove}
          disabled={isDeleting}
          className="font-sans-ui w-full text-center text-xs text-red-600/70 hover:text-red-600 disabled:opacity-50"
        >
          {isDeleting ? "Removing…" : "Remove this brochure"}
        </button>
      </div>
    </div>
  );
}
