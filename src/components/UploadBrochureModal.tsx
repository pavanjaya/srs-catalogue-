"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { buildBrochurePathname, type Brochure } from "@/lib/brochures";

// The only way a brochure gets created: give it a title, choose the PDF,
// upload. Goes straight from the browser to Vercel Blob (not through a
// Server Action) — real brochures run several MB, past Vercel's fixed
// 4.5MB request-body limit for Functions.
export function UploadBrochureModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (brochure: Brochure) => void;
}) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBusy = progress !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isBusy) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Give the brochure a title.");
      return;
    }
    if (!file) {
      setError("Choose a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("That doesn't look like a PDF — please choose a .pdf file.");
      return;
    }

    setError(null);
    setProgress(0);
    try {
      const id = crypto.randomUUID().slice(0, 8);
      const pathname = buildBrochurePathname(id, trimmedTitle);
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/brochures/upload",
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onUploaded({ id, title: trimmedTitle, url: blob.url, uploadedAt: new Date().toISOString() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try again.");
      setProgress(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
      onClick={isBusy ? undefined : onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[var(--paper)] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="font-sans-ui text-xs tracking-[0.2em] text-[var(--ash)] uppercase">New</p>
            <h2 className="text-xl text-[var(--ink)]">Upload Brochure</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close"
            className="font-sans-ui shrink-0 text-lg text-[var(--ink)]/50 hover:text-[var(--ink)] disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <label
          htmlFor="brochure-title"
          className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase"
        >
          Title
        </label>
        <input
          id="brochure-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Table Lights Collection"
          disabled={isBusy}
          className="font-sans-ui mb-5 w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)] disabled:opacity-60"
        />

        <label className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
          PDF File
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={isBusy}
          className="font-sans-ui mb-5 w-full text-sm text-[var(--ink)] disabled:opacity-60"
        />

        {error && <p className="font-sans-ui mb-4 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isBusy}
          className="font-sans-ui w-full rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-60"
        >
          {progress !== null ? `Uploading… ${progress}%` : "Upload"}
        </button>
      </form>
    </div>
  );
}
