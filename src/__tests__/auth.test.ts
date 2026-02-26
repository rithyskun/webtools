import { NextResponse } from 'next/server';
import { requireAuth } from '../lib/auth';

// jest will hoist mocks to the top of the file if we call jest.mock
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}));

import { getToken } from 'next-auth/jwt';

describe('requireAuth helper', () => {
  const fakeReq: any = { headers: {}, cookies: {} };

  beforeEach(() => {
    (getToken as jest.Mock).mockReset();
  });

  it('returns a 401 response when token is missing', async () => {
    (getToken as jest.Mock).mockResolvedValue(null);
    const result = await requireAuth(fakeReq as any);
    expect(result).toBeInstanceOf(NextResponse);
    // verify status and body
    expect(result.status).toBe(401);
    const body = await result.json();
    expect(body).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('returns the token when present', async () => {
    const token = { sub: 'user-id' };
    (getToken as jest.Mock).mockResolvedValue(token);
    const result = await requireAuth(fakeReq as any);
    expect(result).toBe(token);
  });
});
