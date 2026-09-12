// Same resolution order as layout.tsx's metadataBase — the app's own
// canonical origin, used to build absolute links (e.g. inside emails)
// where a relative path won't do.
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
