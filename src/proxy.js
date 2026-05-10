import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes - no auth needed
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  if (publicRoutes.includes(pathname)) return NextResponse.next();

  // API routes for auth and payments (webhooks) are public
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/payments/mpesa/callback")
  ) {
    return NextResponse.next();
  }

  // Not logged in - redirect to login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const role = session.user.role;

  // Admin routes
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Client routes
  if (pathname.startsWith("/client") && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Tasker routes
  if (pathname.startsWith("/tasker") && role !== "TASKER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)",
  ],
};
