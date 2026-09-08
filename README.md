# Shailesh Rajput Studio — Catalogue Library

A tool for sharing PDF brochures on WhatsApp. Upload a brochure once, give it
a title, and it gets its own permanent link — a branded page (studio logo,
title, a "View / Download Catalogue" button) rather than a bare PDF file, so
the WhatsApp preview shows the brochure's name and cover instead of a
generic document icon.

## How it works

There's no database and no fixed list of categories — every brochure is
freeform, created by uploading a PDF and giving it a title. The data model is
the Vercel Blob store itself:

- Each PDF lives at `brochures/<id>--<url-encoded title>.pdf`. The id is
  random (generated at upload time), and doubles as the brochure's public
  URL: `/brochure/<id>`.
- A companion cover-page thumbnail, rendered client-side from the PDF's
  first page at upload time, lives at `brochure-thumbs/<id>.png`.
- `src/lib/brochures.ts` lists the store and reconstructs each brochure's
  `{id, title, url, thumbnailUrl, uploadedAt}` from those paths — the
  listing *is* the source of truth, nothing else to keep in sync.

## URL structure

- **`/`** — the studio's own view (password-protected). Shows every
  brochure as a card; click one to open a popup with a PDF preview, the
  link, an editable WhatsApp message, and Send via WhatsApp / Email. A
  separate **+ Upload Brochure** button is how new ones get added.
- **`/login`** — the password screen for `/`.
- **`/brochure/[id]`** — the actual shareable page (what a WhatsApp link
  points to). Open to anyone with the link, no login step.
- **`/api/brochures/upload`** — issues short-lived upload tokens for
  client-side Blob uploads (see below). Also behind the password.

Client-facing routes (just `/brochure/*`) are intentionally open — a client
opening a shared link lands straight on the brochure. Everything else is
behind the password.

## Why uploads go straight from the browser to Blob storage

Real brochure PDFs run several MB. Vercel Functions have a **hard 4.5MB
request-body limit that no config can raise** — so the file never passes
through a Server Action or API route body. Instead:

1. The browser asks `/api/brochures/upload` for a short-lived upload token
   (`handleUpload` from `@vercel/blob/client`, which also re-checks the
   admin cookie before issuing one).
2. The browser uploads the file *directly* to Vercel Blob using that token.
3. Deleting (`deleteBrochure`, a normal Server Action) sends no file body,
   so it doesn't hit the same limit.

## Password protection

- `ADMIN_PASSWORD` — gates `/`, `/api/brochures/upload`, and everything
  except `/login` and `/brochure/*`. Set via environment variable, never
  hardcoded.

Lives in `src/proxy.ts` (cookie: `srs_admin_session`).

```
ADMIN_PASSWORD=choose-a-strong-password
```

Locally, put that in `.env.local` (already gitignored). On Vercel, add it
under Project Settings → Environment Variables before your first deploy.

## Vercel Blob setup

This project needs a Blob store connected (Project → Storage → Create →
Blob). Once connected, Vercel automatically injects `BLOB_READ_WRITE_TOKEN`
into Production/Preview/Development — no manual token management needed.
For local development, pull it down with:

```bash
vercel env pull
```

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

```bash
npm i -g vercel   # one-time
vercel            # first deploy, follow prompts
vercel --prod     # subsequent production deploys
```

**Set these environment variables in Vercel** (Project Settings →
Environment Variables) before/after your first deploy:

```
ADMIN_PASSWORD=choose-a-strong-password
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.vercel.app
```

`NEXT_PUBLIC_SITE_URL` is needed because WhatsApp/Facebook previews require
an *absolute* image URL — without it, preview images may resolve against
the wrong host. Redeploy after adding any of these.

## Testing a WhatsApp preview

WhatsApp caches link previews aggressively. After replacing a brochure,
test with a tool like
[Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/) or
send the link to yourself first — if the old preview still shows, that's
WhatsApp's cache, not a bug in the site.
