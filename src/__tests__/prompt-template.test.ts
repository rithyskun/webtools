import { GET } from '../app/api/prompt-template/route';
import { buildPromptTemplate } from '../app/api/prompt-template/route';
import { NextRequest, NextResponse } from 'next/server';

jest.mock('../lib/auth', () => ({
  requireAuth: jest.fn()
}));

import { requireAuth } from '../lib/auth';

describe('prompt-template route', () => {
  const dummyReq: any = { headers: new Map(), nextUrl: { pathname: '/api/prompt-template' } };

  beforeEach(() => {
    (requireAuth as jest.Mock).mockReset();
  });

  it('buildPromptTemplate returns expected structure', () => {
    const template = buildPromptTemplate();
    expect(template).toHaveProperty('title', 'Default Prompt');
    expect(template.variables).toBeInstanceOf(Array);
  });

  it('GET returns 401 when not authenticated', async () => {
    const response = new NextResponse(null, { status: 401 });
    (requireAuth as jest.Mock).mockResolvedValue(response);
    const res = await GET(dummyReq as NextRequest);
    expect(res).toBe(response);
  });

  it('GET returns JSON template when authenticated', async () => {
    (requireAuth as jest.Mock).mockResolvedValue({ sub: 'u' });
    const res = await GET(dummyReq as NextRequest);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('title', 'Default Prompt');
  });
});
