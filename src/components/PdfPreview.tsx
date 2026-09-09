"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

const iconButtonClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--ink)]/60 transition hover:bg-[var(--ink)]/5 hover:text-[var(--ink)] disabled:opacity-25 disabled:hover:bg-transparent";

function Divider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-[var(--line)]" aria-hidden="true" />;
}

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

function RotateIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 9a8 8 0 1 1 1.35 8.65"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 4v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ZoomOutIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 21l-4.3-4.3M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ZoomInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A brand-styled PDF preview rendered entirely client-side onto a canvas
// (pdfjs-dist) — replaces the raw browser-native PDF viewer (its own
// toolbar, print/download icons, zoom controls) that looked out of place
// dropped into a branded modal. The page itself, on paper, with our own
// toolbar: rotate, zoom, page navigation, download.
export function PdfPreview({ url, title }: { url: string; title: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<{ destroy: () => Promise<void> } | null>(null);
  const renderTokenRef = useRef(0);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the document once per url — also resets page/zoom/rotation, since
  // those apply to whichever document is currently open.
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setPage(1);
    setZoom(1);
    setRotation(0);
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

  // Render the current page onto the canvas — fit to the available width by
  // default, then scaled further by zoom/rotation (capped for crispness on
  // high-DPI screens).
  useEffect(() => {
    if (isLoading || error || !pdfRef.current || !viewportRef.current || !canvasRef.current) return;
    const token = ++renderTokenRef.current;

    (async () => {
      const pdfPage = await pdfRef.current!.getPage(page);
      if (renderTokenRef.current !== token) return;

      const canvas = canvasRef.current!;
      const available = viewportRef.current!.clientWidth - 48;
      const baseViewport = pdfPage.getViewport({ scale: 1, rotation });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const fitScale = Math.min(available / baseViewport.width, 2);
      const cssScale = fitScale * zoom;
      const viewport = pdfPage.getViewport({ scale: cssScale * dpr, rotation });

      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      canvas.style.width = `${Math.round(viewport.width / dpr)}px`;
      canvas.style.height = `${Math.round(viewport.height / dpr)}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await pdfPage.render({ canvas, canvasContext: ctx, viewport }).promise;
    })();
  }, [page, isLoading, error, zoom, rotation]);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(numPages, p + 1));
  }
  function zoomOut() {
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }
  function zoomIn() {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }
  function rotate() {
    setRotation((r) => (r + 90) % 360);
  }
  function downloadPdf() {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }

  return (
    <div className="flex h-full min-w-0 flex-col outline-none" tabIndex={0} onKeyDown={onKeyDown}>
      <div ref={viewportRef} className="flex min-w-0 flex-1 items-center justify-center overflow-auto p-6">
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

      {!isLoading && !error && (
        <div className="font-sans-ui flex flex-wrap items-center justify-center gap-1 border-t border-[var(--line)] px-3 py-2.5">
          <button type="button" onClick={rotate} aria-label="Rotate" className={iconButtonClass}>
            <RotateIcon />
          </button>

          <Divider />

          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className={iconButtonClass}
          >
            <ZoomOutIcon />
          </button>
          <span className="w-11 shrink-0 text-center text-xs tracking-[0.05em] text-[var(--ash)]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className={iconButtonClass}
          >
            <ZoomInIcon />
          </button>

          {numPages > 1 && (
            <>
              <Divider />
              <button
                type="button"
                onClick={goPrev}
                disabled={page <= 1}
                aria-label="Previous page"
                className={iconButtonClass}
              >
                <ChevronLeftIcon />
              </button>
              <span className="min-w-[3.25rem] shrink-0 text-center text-xs tracking-[0.1em] text-[var(--ash)]">
                {page} / {numPages}
              </span>
              <button
                type="button"
                onClick={goNext}
                disabled={page >= numPages}
                aria-label="Next page"
                className={iconButtonClass}
              >
                <ChevronRightIcon />
              </button>
            </>
          )}

          <Divider />

          <button type="button" onClick={downloadPdf} aria-label="Download" className={iconButtonClass}>
            <DownloadIcon />
          </button>
        </div>
      )}
    </div>
  );
}
