import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPrefixes = ["/owner", "/sitter", "/admin"];
const sessionCookie = "furstay_session";

async function verify(token: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const needsProtection = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  if (!needsProtection) return NextResponse.next();

  const token = request.cookies.get(sessionCookie)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  const payload = await verify(token);
  if (!payload) return NextResponse.redirect(new URL("/login", request.url));

  const role = payload.role as string;
  if (pathname.startsWith("/owner") && role !== "OWNER") return NextResponse.redirect(new URL("/", request.url));
  if (pathname.startsWith("/sitter") && role !== "SITTER") return NextResponse.redirect(new URL("/", request.url));
  if (pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/sitter/:path*", "/admin/:path*"],
};
