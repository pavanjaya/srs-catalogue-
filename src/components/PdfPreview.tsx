"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

function ChevronLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A minimal, brand-styled PDF preview rendered entirely client-side onto a
// canvas (pdfjs-dist) — replaces the raw browser-native PDF viewer (its own
// toolbar, print/download icons, zoom controls) that looked out of place
// dropped into a branded modal. Just the page itself, on paper, with our
// own prev/next controls.
export function PdfPreview({ url, title }: { url: string; title: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<{ destroy: () => Promise<void> } | null>(null);
  const renderTokenRef = useRef(0);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the document once per url.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setPage(1);
    pdfRef.current = null;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjsLib.getDocument({ url });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setError("Couldn't load a preview for this file.");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy?.();
    };
  }, [url]);

  // Render the current page onto the canvas, sized to fill the available
  // width (capped for crispness on high-DPI screens).
  useEffect(() => {
    if (isLoading || error || !pdfRef.current || !viewportRef.current || !canvasRef.current) return;
    const token = ++renderTokenRef.current;

    (async () => {
      const pdfPage = await pdfRef.current!.getPage(page);
      if (renderTokenRef.current !== token) return;

      const canvas = canvasRef.current!;
      const available = viewportRef.current!.clientWidth - 48;
      const baseViewport = pdfPage.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssScale = Math.min(available / baseViewport.width, 1.6);
      const viewport = pdfPage.getViewport({ scale: cssScale * dpr });

      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      canvas.style.width = `${Math.round(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.round(viewport.height / dpr)}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await pdfPage.render({ canvas, canvasContext: ctx, viewport }).promise;
    })();
  }, [page, isLoading, error]);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(numPages, p + 1));
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }

  return (
    <div className="flex h-full flex-col outline-none" tabIndex={0} onKeyDown={onKeyDown}>
      <div ref={viewportRef} className="flex flex-1 items-center justify-center overflow-auto p-6">
        {isLoading && (
          <div className="font-sans-ui flex flex-col items-center gap-3 text-xs text-[var(--ink)]/40">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ink)]/15 border-t-[var(--ink)]/50" />
            Loading preview…
          </div>
        )}
        {error && (
          <div className="font-sans-ui max-w-[220px] text-center text-xs text-[var(--ink)]/50">
            <p className="mb-3">{error}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Open PDF in a new tab ↗
            </a>
          </div>
        )}
        {!isLoading && !error && (
          <canvas ref={canvasRef} aria-label={`${title} — page ${page}`} className="rounded-sm bg-white shadow-lg" />
        )}
      </div>

      {!isLoading && !error && numPages > 1 && (
        <div className="font-sans-ui flex items-center justify-center gap-4 border-t border-[var(--line)] py-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink)]/60 transition hover:bg-[var(--ink)]/5 hover:text-[var(--ink)] disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronLeftIcon />
          </button>
          <span className="min-w-[3.5rem] text-center text-xs tracking-[0.1em] text-[var(--ash)]">
            {page} / {numPages}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={page >= numPages}
            aria-label="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink)]/60 transition hover:bg-[var(--ink)]/5 hover:text-[var(--ink)] disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  );
}
