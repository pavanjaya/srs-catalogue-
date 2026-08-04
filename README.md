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
- `src/app/page.tsx` — the homepage, listing every catalogue grouped by
  category. Useful for Shailesh to find and copy a product's link, and as the
  "browse everything" destination.
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

## Two views: public (clients) vs. admin (Shailesh)

- **Public** (`/`, `/catalogue/[slug]`) — what a client sees after entering
  the PIN. Just the catalogue photo, description, and a PDF button. No way
  to generate or re-share a link from here.
- **Admin** (`/admin`) — a separate, separately-password-protected area for
  composing and sending shares. Lists every product; each has a **Share**
  button that opens a popup with an *editable* pre-filled WhatsApp message
  (product link + PIN + the default greeting). Edit the message however you
  like, then **Send via WhatsApp** opens it addressed to whoever you pick.

This split exists so a client who has the PIN can view catalogues but can't
also generate/re-share links with the PIN embedded — only someone with the
separate admin password can do that composing step.

## Password protection (two separate credentials)

- `SITE_PASSWORD` — the client-facing PIN (recommended: numeric, e.g. 6
  digits, easy to type on a phone). Gates `/`, `/catalogue/*`, and the PDFs.
- `ADMIN_PASSWORD` — a separate, stronger password for `/admin`. The client
  PIN does **not** grant access to `/admin`; an admin session, however, can
  browse the public pages too (so Shailesh can preview what a client sees).

Both live in `src/proxy.ts` (`ADMIN_PASSWORD` cookie: `srs_admin_session`,
`SITE_PASSWORD` cookie: `srs_session`) — social-media crawlers (WhatsApp,
Facebook, etc.) are explicitly let through both gates so per-product link
previews keep working. See the `CRAWLER_UA` allowlist in `src/proxy.ts` if
that list ever needs updating.

Set both via environment variables — never hardcode either:

```
SITE_PASSWORD=choose-a-client-pin
ADMIN_PASSWORD=choose-a-stronger-admin-password
```

Locally, put those in `.env.local` (already gitignored). On Vercel, add them
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
SITE_PASSWORD=choose-a-client-pin
ADMIN_PASSWORD=choose-a-stronger-admin-password
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.vercel.app
```

`SITE_PASSWORD`/`ADMIN_PASSWORD` gate the site (see above).
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
