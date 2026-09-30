import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// First line of defence: bounce logged-out visitors from private areas.
// Role checks (admin only) are enforced again server-side in layouts and actions.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  const isAdmin = pathname.startsWith("/admin");
  const isPrivateAccount =
    pathname.startsWith("/account") &&
    !pathname.startsWith("/account/login") &&
    !pathname.startsWith("/account/register");
  const isCheckout = pathname.startsWith("/checkout");

  if ((isAdmin || isPrivateAccount || isCheckout) && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/account/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (isAdmin && session && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
