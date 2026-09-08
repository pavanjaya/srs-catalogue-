import { NextRequest, NextResponse } from "next/server";

// Always reachable, regardless of session — the admin login page and
// static assets.
const PUBLIC_PREFIXES = ["/login", "/images/", "/brand/", "/fonts/", "/favicon"];

// Client-facing routes (the pages and PDFs a client link actually points
// at) are intentionally open — no PIN. A client opening a shared link
// should land straight on the catalogue, not a login screen. Only the
// admin dashboard (root "/") stays behind ADMIN_PASSWORD.
const CLIENT_PREFIXES = ["/catalogues", "/catalogue/", "/brochure/", "/pdfs/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (CLIENT_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const adminSession = request.cookies.get("srs_admin_session")?.value;
  const isAdmin = !!adminSession && adminSession === process.env.ADMIN_PASSWORD;

  if (isAdmin) return NextResponse.next();

  // Everything else — including the root "/" — is admin-only.
  const adminLoginUrl = new URL("/login", request.url);
  adminLoginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(adminLoginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
