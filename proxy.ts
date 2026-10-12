import { NextResponse, type NextRequest } from "next/server";
import { createProxyClient } from "@/modules/shared/lib/supabase/proxy";

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie on every request.
 *  2. Protect /admin routes — redirect unauthenticated users to /admin/login.
 *  3. Redirect already-authenticated users away from /admin/login to /admin.
 */
export async function proxy(request: NextRequest) {
  const { supabase, supabaseResponse } = await createProxyClient(request);

  // IMPORTANT: Do NOT add any logic between createProxyClient and getUser,
  // and do NOT use the session object — always call getUser() so the token
  // is validated against the Supabase Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // ── Protect admin routes ──────────────────────────────────────────────────

  if (isAdminRoute && !isLoginPage && !user) {
    // Not authenticated → redirect to login, preserve intended destination.
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && user) {
    // Already authenticated → redirect away from login to dashboard.
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(dashboardUrl);
  }

  // ── Pass through (session cookies already refreshed by supabaseResponse) ─
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - _next/static  (bundled assets)
     * - _next/image   (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)",
  ],
};
