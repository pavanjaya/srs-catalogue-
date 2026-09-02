# Shailesh Rajput Studio — Catalogue Platform

A simple site for sharing individual product catalogues on WhatsApp. Each
product gets its **own page and its own link**, so when Shailesh shares a
link, WhatsApp's preview card shows *that specific product's* name and photo
(not a generic homepage). Every product page also shows a grid of the other
catalogues below the fold, so the client can keep browsing without a second
message.

Live sample pages right now use 8 placeholder products (real names, but
placeholder image + PDF files) so you can see exactly how it behaves before
plugging in all 150 real catalogues.

## How it works

- `src/data/products.json` — one entry per product: name, category,
  short description, path to its photo, path to its PDF catalogue.
- `src/app/catalogue/[slug]/page.tsx` — the shareable product page. It reads
  the matching entry from `products.json` and builds the WhatsApp/Facebook
  preview tags (title + photo) specifically for that product.
- `src/app/catalogues/page.tsx` — the public "browse everything" homepage,
  listing every catalogue grouped by category. This is what a client sees,
  not `/` — see the URL structure section below.
- `public/images/` and `public/pdfs/` — the actual photo and PDF files,
  named to match each product's `slug`.

## Adding the real 150 products

For each product:

1. Drop its cover photo into `public/images/<slug>.jpg` (or `.png`/`.webp`).
2. Drop its catalogue PDF into `public/pdfs/<slug>.pdf`.
3. Add an entry to `src/data/products.json`:

   ```json
   {
     "slug": "product-slug",
     "name": "Product Name",
     "category": "Collectables",
     "shortDescription": "One short line about the piece.",
     "image": "/images/product-slug.jpg",
     "pdf": "/pdfs/product-slug.pdf"
   }
   ```

4. Run `npm run build` to regenerate all pages (or just deploy — Vercel runs
   the build automatically).

No admin login, database, or code changes needed beyond editing that one
file — whoever maintains the site (you, or Shailesh with a little guidance)
just edits `products.json` and adds files.

The 8 sample products currently use generated placeholder SVG images and
placeholder one-page PDFs (clearly labeled "PLACEHOLDER"). Just overwrite the
files at the same path with the real photo/PDF and the site picks it up on
next build — no other change needed.

### If the catalogue count grows a lot (500+, frequent updates)

`products.json` stays easy to hand-edit up to a few hundred entries. If this
later needs Shailesh to upload new products himself through a web form
(no file editing at all), that's a bigger upgrade — a small admin panel with
a database — and worth a separate conversation when/if that need shows up.

## URL structure: admin owns the root, public is under /catalogues

The bare domain (`/`) is **admin-only** — reserved for Shailesh, not clients.
Public/client-facing content lives under `/catalogues`:

- **`/`** — admin dashboard (own password). Lists every product with a
  **Share** control that opens a popup with an *editable* pre-filled
  WhatsApp message (product link + greeting). Edit it, then **Send via
  WhatsApp**. This is the primary URL you'd bookmark as Shailesh.
- **`/login`** — admin login (root-level, since admin owns root).
- **`/catalogues`** — the public "browse everything" homepage, what a client
  sees. Just photos, descriptions, and PDF buttons — open to anyone with the
  link, no login step.
- **`/catalogue/[slug]`** — the actual shareable per-product page (singular,
  unchanged path — this is what WhatsApp links point to). Also open, no
  login step.

Client-facing routes (`/catalogues`, `/catalogue/*`, the PDFs) are
intentionally not password-gated — a client opening a shared link lands
straight on the catalogue. Only the admin dashboard at `/` stays behind a
password, since that's where links get generated/shared from.

## Password protection (admin only)

- `ADMIN_PASSWORD` — gates `/` (the admin dashboard) only. Set it via
  environment variable — never hardcode it.

Lives in `src/proxy.ts` (cookie: `srs_admin_session`).

```
ADMIN_PASSWORD=choose-a-strong-admin-password
```

Locally, put that in `.env.local` (already gitignored). On Vercel, add it
under Project Settings → Environment Variables before your first deploy.

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

**Important — set these environment variables in Vercel before/after your
first deploy** (Project Settings → Environment Variables):

```
ADMIN_PASSWORD=choose-a-strong-admin-password
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.vercel.app
```

`ADMIN_PASSWORD` gates the admin dashboard (see above).
`NEXT_PUBLIC_SITE_URL` is needed because WhatsApp/Facebook previews require
an *absolute* image URL — without it, preview images may resolve against the
wrong host. Redeploy after adding any of these. If you later attach a custom
domain (e.g. `catalogue.shaileshrajputstudio.com`), update
`NEXT_PUBLIC_SITE_URL` to match.

## Testing a WhatsApp preview

WhatsApp caches link previews aggressively. After changing a product's photo
or copy, test with a tool like
[Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/) or
send the link to yourself first — if the old preview still shows, that's
WhatsApp's cache, not a bug in the site.
