"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product, ProductCategory } from "@/lib/products";
import { WhatsAppIcon, EmailIcon } from "@/components/ConnectIcons";

// The admin panel's preview-and-share popup. Opens for a whole category
// (left pane = that category's product grid) or, once you click a product
// inside it, narrows to that one product (left pane = its photo + details) —
// same modal, same right-hand compose panel, no page navigation either way.
export function ShareModal({
  category,
  products,
  onClose,
}: {
  category: ProductCategory;
  products: Product[];
  onClose: () => void;
}) {
  const [focused, setFocused] = useState<Product | null>(null);
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const path = focused
      ? `/catalogue/${focused.slug}`
      : `/catalogues?category=${encodeURIComponent(category)}`;
    const fullUrl = `${window.location.origin}${path}`;
    const template = focused
      ? `Hi, here's the catalogue for ${focused.name} you asked about 👇\n{url}\nYou can also browse our other designs from the same page.`
      : `Hi, here's our full ${category} range 👇\n{url}\nBrowse the collection — open any piece for its own catalogue.`;
    setUrl(fullUrl);
    setMessage(template.replace("{url}", fullUrl));
    setCopied(false);
  }, [focused, category]);

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
    const subject = focused ? focused.name : `${category} — Shailesh Rajput Studio`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
      "_blank",
    );
  }

  const title = focused ? focused.name : category;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl bg-[var(--paper)] shadow-2xl sm:flex-row sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — preview of what's being shared */}
        <div className="w-full border-b border-[var(--line)] p-6 sm:w-1/2 sm:overflow-y-auto sm:border-r sm:border-b-0">
          {focused ? (
            <div>
              <button
                onClick={() => setFocused(null)}
                className="font-sans-ui mb-4 text-xs text-[var(--ink)]/60 hover:text-[var(--ink)]"
              >
                ← Back to {category}
              </button>
              <div className="mb-3 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                <Image
                  src={focused.image}
                  alt={focused.name}
                  width={600}
                  height={600}
                  className="h-auto w-full object-cover"
                />
              </div>
              <p className="font-sans-ui text-sm text-[var(--ink)]">{focused.name}</p>
              <p className="font-sans-ui text-xs text-[var(--ink)]/50">{focused.shortDescription}</p>
            </div>
          ) : (
            <div>
              <p className="font-sans-ui mb-4 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
                {category} — {products.length} piece{products.length === 1 ? "" : "s"}
              </p>
              {products.length === 0 ? (
                <p className="font-sans-ui text-sm text-[var(--ink)]/50">
                  More pieces from this category are on their way.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => (
                    <button
                      key={product.slug}
                      onClick={() => setFocused(product)}
                      className="group text-left"
                    >
                      <div className="mb-1 overflow-hidden rounded-lg border border-[var(--line)] bg-white">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="h-auto w-full object-cover transition group-hover:opacity-80"
                        />
                      </div>
                      <p className="font-sans-ui truncate text-xs text-[var(--ink)]/70">
                        {product.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — link, message, send */}
        <div className="flex w-full flex-col p-6 sm:w-1/2">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-sans-ui text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
                Share
              </p>
              <h2 className="text-xl text-[var(--ink)]">{title}</h2>
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
            rows={7}
            className="font-sans-ui mb-5 w-full flex-1 rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />

          <div className="font-sans-ui grid grid-cols-2 gap-3">
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
        </div>
      </div>
    </div>
  );
}
