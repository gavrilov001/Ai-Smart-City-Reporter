import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get user from localStorage (Note: middleware runs on server, so we check cookies instead)
    // For now, we'll use a simple check. In production, verify JWT token
    const userRole = request.cookies.get('userRole')?.value;

    // If not admin role, redirect to login
    if (!userRole || userRole !== 'administrator') {
      // Check if user is authenticated at all
      const user = request.cookies.get('user');
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // User is authenticated but not admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: ['/admin/:path*'],
};
