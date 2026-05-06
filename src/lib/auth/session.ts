/**
 * Session-cookie auth shared across protected API routes.
 *
 * Production fails closed when `SESSION_SECRET` is unset or too short.
 * Local/test environments keep the original Admin/Admin login so the app
 * can run without a separate env file.
 *   - Cookie compare is timing-safe.
 *
 * Phase 2.5.2 will replace the single shared cookie value with an
 * HMAC-signed session. Until then, every protected route uses this
 * helper so we purge the fallback once, not per-route.
 */

import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const MIN_SESSION_SECRET_LEN = 16;

export const AUTH_COOKIE_NAME = 'bulletev-auth';
export const DEFAULT_ADMIN_USERNAME = 'Admin';
export const DEFAULT_ADMIN_PASSWORD = 'Admin';
export const DEFAULT_SESSION_SECRET = 'bulletev-session-v1';

function allowDefaultAdminLogin(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function resolveExpectedSession(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret && allowDefaultAdminLogin()) return DEFAULT_SESSION_SECRET;
  if (!secret || secret.length < MIN_SESSION_SECRET_LEN) return null;
  return secret;
}

export interface AdminEnv {
  username: string;
  password: string;
  sessionSecret: string;
}

/**
 * Resolve login credentials. Production requires env values; local/test
 * fall back to the original Admin/Admin credentials.
 */
export function resolveAdminEnv(): AdminEnv | null {
  const username =
    process.env.ADMIN_USERNAME ?? (allowDefaultAdminLogin() ? DEFAULT_ADMIN_USERNAME : undefined);
  const password =
    process.env.ADMIN_PASSWORD ?? (allowDefaultAdminLogin() ? DEFAULT_ADMIN_PASSWORD : undefined);
  const sessionSecret =
    process.env.SESSION_SECRET ?? (allowDefaultAdminLogin() ? DEFAULT_SESSION_SECRET : undefined);
  if (
    !username ||
    !password ||
    !sessionSecret ||
    sessionSecret.length < MIN_SESSION_SECRET_LEN
  ) {
    return null;
  }
  return { username, password, sessionSecret };
}

export function isAuthenticated(req: NextRequest): boolean {
  const expected = resolveExpectedSession();
  if (!expected) return false;
  const cookie = req.cookies.get(AUTH_COOKIE_NAME);
  const provided = cookie?.value;
  if (typeof provided !== 'string' || provided.length === 0) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Timing-safe string compare for pre-signed-session equality paths. */
export function safeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a constant-time op so we don't reveal the length diff.
    timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
