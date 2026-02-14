import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {

    const token = req.cookies.get("token")?.value
    const isProtected = req.nextUrl.pathname.startsWith("/admin")
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")

    if (isProtected && !token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    if (isAuthPage && token) {

        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ["/admin/:path*", "/login"]
}