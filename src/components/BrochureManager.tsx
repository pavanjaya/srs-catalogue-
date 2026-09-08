"use client";

import { useRef, useState, useTransition } from "react";
import type { ProductCategory } from "@/lib/products";
import { uploadCategoryBrochure, deleteCategoryBrochure } from "@/app/actions/brochures";

// One row per category — this is the only place brochure PDFs get
// uploaded, replaced, or removed. ShareModal (opened from a category tile
// below) is purely for sharing; this is purely for managing the files.
function BrochureRow({
  category,
  initialUrl,
}: {
  category: ProductCategory;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    setError(null);
    fileInputRef.current?.click();
  }

  function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-choosing the same file later
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadCategoryBrochure(category, formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setUrl(result.url);
        setError(null);
      }
    });
  }

  function removeBrochure() {
    startTransition(async () => {
      await deleteCategoryBrochure(category);
      setUrl(undefined);
      setError(null);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-3 last:border-b-0">
      <p className="font-sans-ui text-sm text-[var(--ink)]">{category}</p>

      <div className="font-sans-ui flex items-center gap-3 text-sm">
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onFileChosen} className="hidden" />
        {url ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink)] underline-offset-2 hover:underline"
            >
              View PDF ↗
            </a>
            <button
              onClick={pickFile}
              disabled={isPending}
              className="text-[var(--ink)]/60 hover:text-[var(--ink)] disabled:opacity-50"
            >
              {isPending ? "Uploading…" : "Replace"}
            </button>
            <button
              onClick={removeBrochure}
              disabled={isPending}
              className="text-[var(--ink)]/60 hover:text-[var(--ink)] disabled:opacity-50"
            >
              Remove
            </button>
          </>
        ) : (
          <button
            onClick={pickFile}
            disabled={isPending}
            className="text-[var(--ink)] underline-offset-2 hover:underline disabled:opacity-50"
          >
            {isPending ? "Uploading…" : "Upload PDF →"}
          </button>
        )}
      </div>

      {error && <p className="font-sans-ui w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function BrochureManager({
  categories,
  brochures,
}: {
  categories: readonly ProductCategory[];
  brochures: Partial<Record<ProductCategory, string>>;
}) {
  return (
    <section className="mb-14 rounded-2xl border border-[var(--line)] bg-white p-6">
      <p className="font-sans-ui mb-1 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
        Manage Brochures
      </p>
      <p className="font-sans-ui mb-5 text-sm text-[var(--ink)]/60">
        One PDF per category. Upload here once — it appears immediately on that category&apos;s
        public page and stays there until replaced or removed.
      </p>
      <div>
        {categories.map((category) => (
          <BrochureRow key={category} category={category} initialUrl={brochures[category]} />
        ))}
      </div>
    </section>
  );
}
