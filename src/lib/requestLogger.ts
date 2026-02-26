import { logger } from './logger';
import { NextRequest } from 'next/server';

export async function logApiRequest(
  request: NextRequest,
  statusCode: number,
  duration: number,
  additionalData?: Record<string, any>
): Promise<void> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  await logger.logRequest(
    request.method,
    request.nextUrl.pathname,
    ip,
    statusCode,
    duration,
    {
      userAgent,
      ...additionalData,
    }
  ).catch((error) => {
    console.error('Failed to log request:', error);
  });
}

export function createRequestLogger(request: NextRequest) {
  const startTime = Date.now();
  
  return {
    log: async (statusCode: number, additionalData?: Record<string, any>) => {
      const duration = Date.now() - startTime;
      await logApiRequest(request, statusCode, duration, additionalData);
    },
  };
}
