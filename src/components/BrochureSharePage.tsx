"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WhatsAppIcon, EmailIcon } from "@/components/ConnectIcons";
import { deleteBrochure, updateBrochureTags } from "@/app/actions/brochures";
import { buildBrochurePathname, type Brochure } from "@/lib/brochures";
import { PdfPreview } from "@/components/PdfPreview";
import { TagInput } from "@/components/TagInput";

function CopyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9.5 14.5 14.5 9.5M11 7.5l1.4-1.4a3.5 3.5 0 0 1 5 5L16 12.5M13 16.5l-1.4 1.4a3.5 3.5 0 0 1-5-5L8 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7h12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The full-page version of what used to be ShareModal — sharing a
// catalogue (reviewing the PDF, writing a message that feels personal,
// sending it) is this tool's actual job, and doing that inside a small
// column squeezed next to a preview, in a dimmed popup, worked against
// it. This gets its own page and URL instead: a bigger preview, a
// calmer compose column, no backdrop.
export function BrochureSharePage({
  brochure,
  allTags,
}: {
  brochure: Brochure;
  allTags: string[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState(
    `Hi, sharing the ${brochure.title} catalogue from Shailesh Rajput Studio.\n\nTake a look whenever suits you — happy to talk through any piece that catches your eye.`,
  );
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [tags, setTags] = useState<string[]>(brochure.tags);
  const [tagsDirty, setTagsDirty] = useState(false);
  const [isSavingTags, startTagsTransition] = useTransition();
  const [organizeOpen, setOrganizeOpen] = useState(
    () => brochure.tags.length > 0 || !!brochure.websiteLink,
  );
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/brochure/${brochure.id}`);
  }, [brochure.id]);

  // Escape backs out of the confirm popup first, same as the old modal.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && confirmingRemove) setConfirmingRemove(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmingRemove]);

  function handleTagsChange(next: string[]) {
    setTags(next);
    setTagsDirty(true);
  }

  function saveTags() {
    startTagsTransition(async () => {
      const saved = await updateBrochureTags(brochure.id, tags);
      setTags(saved);
      setTagsDirty(false);
    });
  }

  function organizeSummary(): string {
    const parts: string[] = [];
    if (tags.length > 0) parts.push(`${tags.length} tag${tags.length === 1 ? "" : "s"}`);
    if (brochure.websiteLink) parts.push(brochure.websiteLink.label);
    return parts.length > 0 ? parts.join(" · ") : "Tags, website link";
  }

  async function copyUrl() {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return;
    } catch {
      // Clipboard API can be denied — fall back to select + legacy copy.
    }
    const input = urlInputRef.current;
    input?.focus();
    input?.select();
    try {
      const ok = document.execCommand("copy");
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      }
    } catch {
      // fall through
    }
    setCopyFailed(true);
    setTimeout(() => setCopyFailed(false), 3000);
  }

  function fullMessage() {
    return `${message}\n\n${url}`;
  }

  function sendWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage())}`, "_blank");
  }

  function sendEmail() {
    window.open(
      `mailto:?subject=${encodeURIComponent(brochure.title)}&body=${encodeURIComponent(fullMessage())}`,
      "_blank",
    );
  }

  function confirmRemove() {
    startDeleteTransition(async () => {
      await deleteBrochure(buildBrochurePathname(brochure.id, brochure.title), brochure.id);
      router.push("/");
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
      <Link
        href="/"
        className="font-sans-ui mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink)]/60 hover:text-[var(--ink)]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Library
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <p className="font-sans-ui mb-1 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">Share</p>
          <h1 className="mb-6 text-2xl text-[var(--ink)] sm:text-3xl">{brochure.title}</h1>
          <div className="h-[70vh] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper-2)]">
            <PdfPreview url={brochure.url} title={brochure.title} />
          </div>
        </div>

        <div className="lg:pt-[52px]">
          <label className="font-sans-ui mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
            Link
          </label>
          <div className="mb-2 flex items-center gap-2">
            <input
              ref={urlInputRef}
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              className="font-sans-ui w-0 flex-1 truncate rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-xs text-[var(--ink)]/70 outline-none"
            />
            <button
              onClick={copyUrl}
              className={`font-sans-ui flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                copied
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--ink)]"
              }`}
            >
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {copyFailed && (
            <p className="font-sans-ui mb-3 text-xs text-red-600">
              Couldn&apos;t copy automatically — the link is selected above, press ⌘C / Ctrl+C to
              copy it.
            </p>
          )}

          <div className="font-sans-ui mb-5 rounded-lg border border-[var(--line)]">
            <button
              type="button"
              onClick={() => setOrganizeOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="shrink-0 text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
                Organize
              </span>
              <span className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--ink)]/50">
                <span className="truncate">{organizeSummary()}</span>
                <ChevronIcon
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${organizeOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {organizeOpen && (
              <div className="border-t border-[var(--line)] p-4">
                <label className="mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
                  Tags
                </label>
                <TagInput tags={tags} onChange={handleTagsChange} suggestions={allTags} />
                <p className="mt-1.5 mb-2 shrink-0 truncate text-xs text-[var(--ink)]/50">
                  Shared tags control cross-sell in &ldquo;Explore More.&rdquo;
                </p>
                {tagsDirty && (
                  <button
                    onClick={saveTags}
                    disabled={isSavingTags}
                    className="mb-4 w-full rounded-full border border-[var(--ink)] px-4 py-2 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-white disabled:opacity-50"
                  >
                    {isSavingTags ? "Saving tags…" : "Save tags"}
                  </button>
                )}

                <label className="mb-2 block text-xs tracking-[0.2em] text-[var(--ash)] uppercase">
                  Website Link
                </label>
                <p className="text-sm text-[var(--ink)]">
                  {brochure.websiteLink ? brochure.websiteLink.label : "No Website Link"}
                </p>
                <p className="mt-1.5 shrink-0 text-xs text-[var(--ink)]/50">
                  Set at upload — not editable here.
                </p>
              </div>
            )}
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
            className="font-sans-ui min-h-[160px] w-full resize-none rounded-t-lg border border-b-0 border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]"
          />
          <div className="font-sans-ui mb-5 flex items-center gap-2 rounded-b-lg border border-[var(--line)] bg-[var(--paper-2)]/60 px-4 py-2.5 text-xs text-[var(--ink)]/60">
            <LinkIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{url}</span>
            <span className="ml-auto shrink-0 text-[var(--ink)]/40">Always included</span>
          </div>

          <div className="font-sans-ui mb-8 grid grid-cols-2 gap-3">
            <button
              onClick={sendWhatsApp}
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent)] hover:text-[var(--ink)]"
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              WhatsApp
            </button>
            <button
              onClick={sendEmail}
              className="flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              <EmailIcon className="h-5 w-5 shrink-0" />
              Email
            </button>
          </div>

          <div className="border-t border-[var(--line)] pt-5">
            <button
              onClick={() => setConfirmingRemove(true)}
              className="font-sans-ui flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              Remove this brochure
            </button>
          </div>
        </div>
      </div>

      {confirmingRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setConfirmingRemove(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="font-sans-ui w-full max-w-sm rounded-2xl bg-[var(--paper)] p-6 shadow-2xl"
          >
            <h3 className="mb-2 text-lg text-[var(--ink)]">Remove brochure?</h3>
            <p className="mb-5 text-sm text-[var(--ink)]/70">
              Remove &ldquo;{brochure.title}&rdquo;? This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmingRemove(false)}
                disabled={isDeleting}
                className="flex-1 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
