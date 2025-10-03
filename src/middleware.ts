import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // If refresh token is missing → redirect to signin
  if (!refreshToken) {
    const signinUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signinUrl);
  }

  // Otherwise allow
  return NextResponse.next();
}

// Only run middleware on protected paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/quiz/:path*",
    "/pdf-summary/:path*",
  ],
};
// add the website url in google login .