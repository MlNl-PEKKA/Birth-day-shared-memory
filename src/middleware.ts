import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Public paths that don't need authentication
    const publicPaths = ["/sign-in", "/sign-up", "/api/trpc/public"];
    if (publicPaths.some(p => path.startsWith(p))) {
      return NextResponse.next();
    }

    // Admin only paths
    const adminPaths = ["/admin", "/api/trpc/admin"];
    if (adminPaths.some(p => path.startsWith(p)) && token?.role !== "ADMIN" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Super admin only paths
    const superAdminPaths = ["/super-admin", "/api/trpc/super-admin"];
    if (superAdminPaths.some(p => path.startsWith(p)) && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 