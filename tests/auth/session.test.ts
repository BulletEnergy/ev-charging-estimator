/**
 * Phase 2.5.1 — session helper contract.
 *
 * These guards document the auth contract: local/test environments allow
 * the original Admin/Admin login without an env file, while production
 * still fails closed when required secrets are missing.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_SESSION_SECRET,
  MIN_SESSION_SECRET_LEN,
  isAuthenticated,
  resolveAdminEnv,
  resolveExpectedSession,
  safeStringEqual,
} from '@/lib/auth/session';

function mockRequest(cookieValue: string | null): Parameters<typeof isAuthenticated>[0] {
  return {
    cookies: {
      get: (name: string) =>
        name === 'bulletev-auth' && cookieValue !== null
          ? { value: cookieValue }
          : undefined,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

describe('resolveExpectedSession', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.SESSION_SECRET;
  });

  it('returns the local/test default when SESSION_SECRET is unset', () => {
    expect(resolveExpectedSession()).toBe(DEFAULT_SESSION_SECRET);
  });

  it('returns null when SESSION_SECRET is shorter than the minimum', () => {
    process.env.SESSION_SECRET = 'short';
    expect(resolveExpectedSession()).toBeNull();
  });

  it('returns the secret when at least MIN_SESSION_SECRET_LEN', () => {
    const secret = 'x'.repeat(MIN_SESSION_SECRET_LEN);
    process.env.SESSION_SECRET = secret;
    expect(resolveExpectedSession()).toBe(secret);
  });

  it('returns null in production when SESSION_SECRET is unset', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.SESSION_SECRET;
    expect(resolveExpectedSession()).toBeNull();
  });
});

describe('isAuthenticated', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.SESSION_SECRET;
  });

  it('accepts the local/test default cookie when SESSION_SECRET is unset', () => {
    expect(isAuthenticated(mockRequest(DEFAULT_SESSION_SECRET))).toBe(true);
    expect(isAuthenticated(mockRequest('anything'))).toBe(false);
    expect(isAuthenticated(mockRequest(null))).toBe(false);
  });

  it('accepts only a matching cookie when secret is set', () => {
    const secret = 'proper-length-secret-123';
    process.env.SESSION_SECRET = secret;
    expect(isAuthenticated(mockRequest(secret))).toBe(true);
    expect(isAuthenticated(mockRequest(secret + 'x'))).toBe(false);
    expect(isAuthenticated(mockRequest(null))).toBe(false);
  });
});

describe('resolveAdminEnv', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.SESSION_SECRET;
  });

  it('returns the local/test default tuple when env is missing', () => {
    expect(resolveAdminEnv()).toEqual({
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD,
      sessionSecret: DEFAULT_SESSION_SECRET,
    });
  });

  it('returns null in production when any required env is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(resolveAdminEnv()).toBeNull();
    process.env.ADMIN_USERNAME = 'u';
    expect(resolveAdminEnv()).toBeNull();
    process.env.ADMIN_PASSWORD = 'p';
    expect(resolveAdminEnv()).toBeNull();
  });

  it('returns null when SESSION_SECRET is too short', () => {
    process.env.ADMIN_USERNAME = 'u';
    process.env.ADMIN_PASSWORD = 'p';
    process.env.SESSION_SECRET = 'short';
    expect(resolveAdminEnv()).toBeNull();
  });

  it('returns the full tuple when all envs are valid', () => {
    process.env.ADMIN_USERNAME = 'real-user';
    process.env.ADMIN_PASSWORD = 'real-pass';
    const secret = 'x'.repeat(MIN_SESSION_SECRET_LEN);
    process.env.SESSION_SECRET = secret;
    const env = resolveAdminEnv();
    expect(env).toEqual({
      username: 'real-user',
      password: 'real-pass',
      sessionSecret: secret,
    });
  });
});

describe('safeStringEqual', () => {
  it('returns true on equal strings and false otherwise without throwing', () => {
    expect(safeStringEqual('abc', 'abc')).toBe(true);
    expect(safeStringEqual('abc', 'abd')).toBe(false);
    expect(safeStringEqual('', '')).toBe(true);
    expect(safeStringEqual('abc', 'abcd')).toBe(false); // length mismatch
    expect(safeStringEqual('abcd', 'abc')).toBe(false);
  });
});
