import { authOptions } from '../app/api/auth/[...nextauth]/route';

describe('authOptions provider configuration', () => {
  beforeEach(() => {
    // clear process env changes between tests
    delete process.env.AUTH0_CLIENT_ID;
    delete process.env.AUTH0_CLIENT_SECRET;
    delete process.env.AUTH0_ISSUER;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  it('includes no providers by default', () => {
    expect(authOptions.providers).toEqual([]);
  });

  it('skips Auth0 provider if issuer is invalid', () => {
    process.env.AUTH0_CLIENT_ID = 'id';
    process.env.AUTH0_CLIENT_SECRET = 'secret';
    process.env.AUTH0_ISSUER = 'not-a-url';

    // re-import module to pick up new envs
    jest.resetModules();
    const { authOptions: opts } = require('../app/api/auth/[...nextauth]/route');
    expect(opts.providers).toEqual([]);
  });

  it('adds Auth0 provider when all envs valid', () => {
    process.env.AUTH0_CLIENT_ID = 'id';
    process.env.AUTH0_CLIENT_SECRET = 'secret';
    process.env.AUTH0_ISSUER = 'https://tenant.auth0.com';

    jest.resetModules();
    const { authOptions: opts } = require('../app/api/auth/[...nextauth]/route');
    expect(opts.providers.length).toBe(1);
    // provider should have id 'auth0'
    expect((opts.providers[0] as any).id).toBe('auth0');
  });

  it('adds GitHub and Google providers when set', () => {
    process.env.GITHUB_CLIENT_ID = 'gId';
    process.env.GITHUB_CLIENT_SECRET = 'gSecret';
    process.env.GOOGLE_CLIENT_ID = 'oId';
    process.env.GOOGLE_CLIENT_SECRET = 'oSecret';

    jest.resetModules();
    const { authOptions: opts } = require('../app/api/auth/[...nextauth]/route');
    const ids = opts.providers.map((p: any) => p.id).sort();
    expect(ids).toEqual(['github', 'google']);
  });
});
