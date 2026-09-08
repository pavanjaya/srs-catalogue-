"use client";

import { useState } from "react";
import type { Brochure } from "@/lib/brochures";
import { UploadBrochureModal } from "@/components/UploadBrochureModal";
import { ShareModal } from "@/components/ShareModal";

function PdfIcon({ className = "h-8 w-8" }: { className?: string }) {
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
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="font-sans-ui mb-1 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
            Brochures
          </p>
          <p className="font-sans-ui max-w-md text-sm text-[var(--ink)]/60">
            Every brochure gets its own link. Upload once, share it, replace it whenever there's a
            new version.
          </p>
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
          <p className="font-sans-ui mb-4 text-sm text-[var(--ink)]/50">No brochures yet.</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="font-sans-ui text-sm text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Upload your first brochure →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brochures.map((brochure) => (
            <button
              key={brochure.id}
              onClick={() => setShareTarget(brochure)}
              className="group rounded-xl border border-[var(--line)] bg-white p-5 text-left transition hover:border-[var(--ink)]"
            >
              <PdfIcon className="mb-4 h-8 w-8 text-[var(--ash)] transition group-hover:text-[var(--ink)]" />
              <p className="font-sans-ui mb-1 text-sm text-[var(--ink)]">{brochure.title}</p>
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
