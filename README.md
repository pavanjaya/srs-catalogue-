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

## Sharing a catalogue on WhatsApp

Every product page has a **Share on WhatsApp** button that pre-fills a
message with that product's name and page link (using the short/direct
message style from the original templates). Shailesh can also just copy the
page URL from the address bar and paste it into any chat — the WhatsApp
preview card will still pick up the right name and photo automatically.

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

**Important — set the site URL after your first deploy.** WhatsApp/Facebook
previews need an *absolute* image URL. In the Vercel project settings, add
an environment variable:

```
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.vercel.app
```

then redeploy. Without it, preview images may resolve against the wrong
host. If you later attach a custom domain (e.g.
`catalogue.shaileshrajputstudio.com`), update this variable to match.

## Testing a WhatsApp preview

WhatsApp caches link previews aggressively. After changing a product's photo
or copy, test with a tool like
[Meta's Sharing Debugger](https://developers.facebook.com/tools/debug/) or
send the link to yourself first — if the old preview still shows, that's
WhatsApp's cache, not a bug in the site.
