// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout'
];

// Add todos API allowlist
const todoApiPaths = [
  '/api/todos',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/api/auth/')
  );
  
  // Allow access to static files and public paths
  if (
    path.includes('.') || // Static files like images, CSS
    isPublicPath
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  // If there is no token and the path requires authentication
  if (!token) {
    // For API routes, return 401 Unauthorized
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to login
    // Get the correct base URL for the environment
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocalhost ? 'http' : 'https';
    
    // For production, use the production domain
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
      baseUrl = 'https://nexdo.baharihari.com';
    } else {
      baseUrl = `${protocol}://${host}`;
    }
    
    // Get the original path and query
    const originalPath = request.nextUrl.pathname + request.nextUrl.search;
    
    // Create the redirect URL
    const loginUrl = new URL('/login', baseUrl);
    
    // Set the proper callbackUrl
    const callbackUrl = `${baseUrl}${originalPath}`;
    loginUrl.searchParams.set('callbackUrl', callbackUrl);
    
    // Debug logs (remove in production if not needed)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Redirect to login with:', {
        originalUrl: request.url,
        redirectUrl: loginUrl.toString(),
        callbackUrl: callbackUrl
      });
    }
    
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-key-change-in-production'
    );
    
    const { payload } = await jwtVerify(token, secret);
    
    // Token is valid, continue
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-role', payload.role as string);
    
    // Clone the request with the new headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token is invalid or expired
    console.error('Token verification failed:', error);
    
    // For API routes, return 401 Unauthorized
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to login and clear the cookie
    // Get the correct base URL for the environment
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocalhost ? 'http' : 'https';
    
    // For production, use the production domain
    let baseUrl;
    if (process.env.NODE_ENV === 'production') {
      baseUrl = 'https://nexdo.baharihari.com';
    } else {
      baseUrl = `${protocol}://${host}`;
    }
    
    // Create the redirect URL
    const loginUrl = new URL('/login', baseUrl);
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: 'strict',
      path: '/',
    });
    
    return response;
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all paths except:
    // - Static files (_next/static, _next/image, favicon.ico)
    // - Todo API paths (based on todoApiPaths above)
    '/((?!_next/static|_next/image|favicon.ico|api/todos).*)',
  ],
};