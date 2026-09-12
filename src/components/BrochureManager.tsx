"use client";

import { useMemo, useState } from "react";
import type { Brochure } from "@/lib/brochures";
import type { WebsiteLinkOptions } from "@/lib/websiteLink";
import { UploadBrochureModal } from "@/components/UploadBrochureModal";
import { BrochureCard } from "@/components/BrochureCard";

function EmptyLibraryIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="8" width="13" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 5h11a1.5 1.5 0 0 1 1.5 1.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 13h7M7.5 16.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// The whole admin homepage: nothing until you upload something, then every
// brochure is a card — click it to open its own share page at
// /library/[id] (reviewing the PDF, writing the message, sending, tags,
// website link, remove — all live there now, not in a modal).
export function BrochureManager({
  initialBrochures,
  websiteLinkOptions,
}: {
  initialBrochures: Brochure[];
  websiteLinkOptions: WebsiteLinkOptions;
}) {
  const [brochures, setBrochures] = useState(initialBrochures);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Every distinct tag already in use, for the tag-input's suggestions —
  // recomputed whenever the library changes.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const b of brochures) for (const t of b.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [brochures]);

  function handleUploaded(brochure: Brochure) {
    setBrochures((prev) => [brochure, ...prev]);
    setUploadOpen(false);
  }

  function handleDeleted(id: string) {
    setBrochures((prev) => prev.filter((b) => b.id !== id));
  }

  function handleTagsSaved(id: string, tags: string[]) {
    setBrochures((prev) => prev.map((b) => (b.id === id ? { ...b, tags } : b)));
  }

  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between gap-4 border-t border-[var(--line)] pt-6">
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
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--line)] px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--paper-2)]/70">
            <EmptyLibraryIcon className="h-7 w-7 text-[var(--ink)]/45" />
          </div>
          <p className="font-sans-ui mb-4 text-sm text-[var(--ink)]/50">
            Nothing here yet — the first catalogue starts the library.
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="font-sans-ui text-sm font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Upload your first brochure →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brochures.map((brochure) => (
            <BrochureCard
              key={brochure.id}
              brochure={brochure}
              allTags={allTags}
              onDeleted={handleDeleted}
              onTagsSaved={handleTagsSaved}
            />
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadBrochureModal
          allTags={allTags}
          websiteLinkOptions={websiteLinkOptions}
          onClose={() => setUploadOpen(false)}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  );
}
