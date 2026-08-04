import { NextRequest, NextResponse } from "next/server";

// Bypass the password gate for social-media link-preview crawlers, so
// WhatsApp/Facebook/etc. can still fetch OG tags for the share previews.
const CRAWLER_UA =
  /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|redditbot/i;

// Always reachable, regardless of session — login pages and static assets.
const PUBLIC_PREFIXES = [
  "/login", // admin login (root-level)
  "/catalogues/login", // client PIN login
  "/images/",
  "/brand/",
  "/fonts/",
  "/favicon",
];

// Client-facing routes: gated by the PIN (SITE_PASSWORD), or by an admin
// session (an admin can preview everything a client sees).
const CLIENT_PREFIXES = ["/catalogues", "/catalogue/", "/pdfs/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (CRAWLER_UA.test(userAgent)) {
    return NextResponse.next();
  }

  const adminSession = request.cookies.get("srs_admin_session")?.value;
  const isAdmin = !!adminSession && adminSession === process.env.ADMIN_PASSWORD;

  if (isAdmin) return NextResponse.next();

  const isClientPath = CLIENT_PREFIXES.some((p) => pathname.startsWith(p));

  if (isClientPath) {
    const session = request.cookies.get("srs_session")?.value;
    if (session && session === process.env.SITE_PASSWORD) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/catalogues/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Everything else — including the root "/" — is admin-only.
  const adminLoginUrl = new URL("/login", request.url);
  adminLoginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(adminLoginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
