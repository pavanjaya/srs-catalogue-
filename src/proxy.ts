import { NextRequest, NextResponse } from "next/server";

// Bypass the password gate for social-media link-preview crawlers, so
// WhatsApp/Facebook/etc. can still fetch OG tags for the share previews.
const CRAWLER_UA =
  /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterest|redditbot/i;

const PUBLIC_PREFIXES = [
  "/login",
  "/admin/login",
  "/images/",
  "/brand/",
  "/fonts/",
  "/favicon",
];

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
  const isAdmin =
    !!adminSession && adminSession === process.env.ADMIN_PASSWORD;

  // /admin/* requires the separate admin credential — the client PIN never
  // grants access here, even though an admin session can browse everywhere.
  if (pathname.startsWith("/admin")) {
    if (isAdmin) return NextResponse.next();
    const adminLoginUrl = new URL("/admin/login", request.url);
    adminLoginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(adminLoginUrl);
  }

  if (isAdmin) return NextResponse.next();

  const session = request.cookies.get("srs_session")?.value;
  if (session && session === process.env.SITE_PASSWORD) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
