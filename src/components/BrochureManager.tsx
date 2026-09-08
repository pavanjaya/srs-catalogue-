"use client";

import Image from "next/image";
import { useState } from "react";
import type { Brochure } from "@/lib/brochures";
import { UploadBrochureModal } from "@/components/UploadBrochureModal";
import { ShareModal } from "@/components/ShareModal";

export function PdfIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// The whole admin homepage: nothing until you upload something, then every
// brochure is a card — click it to share (or remove) via ShareModal.
export function BrochureManager({ initialBrochures }: { initialBrochures: Brochure[] }) {
  const [brochures, setBrochures] = useState(initialBrochures);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Brochure | null>(null);

  function handleUploaded(brochure: Brochure) {
    setBrochures((prev) => [brochure, ...prev]);
    setUploadOpen(false);
  }

  function handleDeleted(id: string) {
    setBrochures((prev) => prev.filter((b) => b.id !== id));
    setShareTarget(null);
  }

  return (
    <div>
      <div className="mb-10 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-8">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg text-[var(--ink)]">Library</h2>
          <span className="font-sans-ui text-xs text-[var(--ink)]/40">
            {brochures.length === 0
              ? "empty"
              : `${brochures.length} catalogue${brochures.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="font-sans-ui shrink-0 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
        >
          + Upload Brochure
        </button>
      </div>

      {brochures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] py-20 text-center">
          <p className="font-sans-ui mb-4 text-sm text-[var(--ink)]/50">
            Nothing here yet — the first catalogue starts the library.
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="font-sans-ui text-sm text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Upload your first brochure →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brochures.map((brochure) => (
            <button key={brochure.id} onClick={() => setShareTarget(brochure)} className="group text-left">
              <div className="mb-2 flex aspect-[297/210] items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-white">
                {brochure.thumbnailUrl ? (
                  <Image
                    src={brochure.thumbnailUrl}
                    alt={brochure.title}
                    width={800}
                    height={566}
                    unoptimized
                    className="h-full w-full object-cover transition group-hover:opacity-80"
                  />
                ) : (
                  <PdfIcon className="h-10 w-10 text-[var(--line)]" />
                )}
              </div>
              <p className="font-sans-ui truncate text-sm text-[var(--ink)]">{brochure.title}</p>
              <p className="font-sans-ui text-xs text-[var(--ink)]/50">{formatDate(brochure.uploadedAt)}</p>
            </button>
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadBrochureModal onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
      )}
      {shareTarget && (
        <ShareModal
          brochure={shareTarget}
          onClose={() => setShareTarget(null)}
          onDeleted={() => handleDeleted(shareTarget.id)}
        />
      )}
    </div>
  );
}
