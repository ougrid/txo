import { NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/analytics',
  '/dashboard/data',
  '/profile',
  '/file-upload',
  '/calendar',
  '/shop-management',
  '/platform-management',
  '/order-analytics',
];

// Define public routes that should redirect to how-it-works if authenticated
const authRoutes = [
  '/signin',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token from cookies or localStorage (we'll check both)
  const sessionCookie = request.cookies.get('miniseller_auth_session');
  
  // For client-side localStorage, we need to check via a different approach
  // Since middleware runs on the server, we'll use a cookie approach for route protection
  const isAuthenticated = sessionCookie !== undefined;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is auth-specific (signin/signup)
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes (redirect to how-it-works if already authenticated)
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/how-it-works';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Allow all other routes (including public routes)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
