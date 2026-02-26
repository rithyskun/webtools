import { NextRequest, NextResponse } from "next/server";
import { addNoCacheHeaders, addSecurityHeaders, corsHeaders, isOriginAllowed } from "./lib/securityHeader";
import { globalRateLimiter } from "./lib/rateLimiter";

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    Object.entries(corsHeaders(origin || undefined)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;
  }

  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (origin && !isOriginAllowed(origin)) {
      return NextResponse.json(
        {
          success: false,
          message: 'CORS policy violation',
          error: 'Origin not allowed',
        },
        { status: 403 }
      );
    }

    const rateLimit = globalRateLimiter.check(ip);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          message: 'Too many requests',
          error: 'Rate limit exceeded',
        },
        { status: 429 }
      );

      response.headers.set('X-RateLimit-Limit', '100');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
      response.headers.set('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString());

      addNoCacheHeaders(response);
      return addSecurityHeaders(response);
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    Object.entries(corsHeaders(origin || undefined)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    addNoCacheHeaders(response);
    return addSecurityHeaders(response);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
