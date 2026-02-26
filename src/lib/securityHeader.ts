import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Helmet-style security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // HSTS - Force HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'none'; " +
    "script-src 'self'; " +
    "connect-src 'self'; " +
    "img-src 'self' data: https:; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // Comprehensive Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), ' +
    'ambient-light-sensor=(), ' +
    'autoplay=(), ' +
    'battery=(), ' +
    'camera=(), ' +
    'cross-origin-isolated=(), ' +
    'display-capture=(), ' +
    'document-domain=(), ' +
    'encrypted-media=(), ' +
    'execution-while-not-rendered=(), ' +
    'execution-while-out-of-viewport=(), ' +
    'fullscreen=(), ' +
    'geolocation=(), ' +
    'gyroscope=(), ' +
    'keyboard-map=(), ' +
    'magnetometer=(), ' +
    'microphone=(), ' +
    'midi=(), ' +
    'navigation-override=(), ' +
    'payment=(), ' +
    'picture-in-picture=(), ' +
    'publickey-credentials-get=(), ' +
    'screen-wake-lock=(), ' +
    'sync-xhr=(), ' +
    'usb=(), ' +
    'web-share=(), ' +
    'xr-spatial-tracking=()'
  );
  
  return response;
}

export function addNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  
  return response;
}

export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return false;
  
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  if (allowedOrigins.length === 0) return true;
  
  return allowedOrigins.includes(origin);
}

export function corsHeaders(origin?: string): Record<string, string> {
  const isAllowed = isOriginAllowed(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-webhook-signature, x-gmail-token, x-api-key',
    'Access-Control-Max-Age': '86400',
  };
}
