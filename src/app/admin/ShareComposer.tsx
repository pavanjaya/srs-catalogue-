"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";

function defaultMessage(product: Product, url: string, pin?: string) {
  const pinLine = pin ? `\nAccess PIN: ${pin}` : "";
  return `Hi, here's the catalogue for ${product.name} you asked about 👇\n${url}${pinLine}\nYou can also browse our other designs from the same page.`;
}

export function ShareComposer({
  product,
  pin,
}: {
  product: Product;
  pin?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  function handleOpen() {
    const url = `${window.location.origin}/catalogue/${product.slug}`;
    setMessage(defaultMessage(product, url, pin));
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
        className="font-sans-ui rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-medium text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]"
      >
        Share
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
            <h2 className="mb-4 text-xl">{product.name}</h2>

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
