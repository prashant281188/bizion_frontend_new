import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const authRoutes = ["/login", "/register"];

  // If no token → block admin
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If token exists → block login
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
