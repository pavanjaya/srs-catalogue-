export const studio = {
  name: "Shailesh Rajput Studio",
  // The real domain still points to the old WordPress site until DNS is
  // cut over to the new Next.js one — WEBSITE_URL lets this temporarily
  // point at that new site's own Vercel URL instead, so "Visit full
  // website" and the per-brochure "Explore on our website" link actually
  // work today. Once the domain is cut over, just remove the WEBSITE_URL
  // env var on Vercel — no code change needed, this falls back to the
  // real domain automatically.
  website: process.env.WEBSITE_URL ?? "https://shaileshrajputstudio.com",
  phone: "+919967788543",
  whatsapp: "919967788543",
  email: "shaileshrajputstudio@gmail.com",
  instagram: "https://www.instagram.com/shaileshrajputstudio/",
  instagramDm: "https://ig.me/m/shaileshrajputstudio",
  facebook: "https://www.facebook.com/ShaileshRajputStudio",
};
