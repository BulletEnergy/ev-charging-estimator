/**
 * GET /api/presentation/[token]/bootstrap
 *
 * Public endpoint (token in URL = authorization). Returns the same
 * `PresentationBootstrap` shape that the server page composes, for
 * client-side refresh paths (e.g. after saving a layout revision we
 * will want to re-fetch in Phase 4).
 *
 * The capability token embedded in the response is freshly issued on
 * every call; client must call this again once its capabilityToken is
 * near expiry.
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadPresentationByToken } from '@/lib/presentation/fetchPresentation';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  if (!token || !/^[A-Za-z0-9_-]+$/.test(token)) {
    return NextResponse.json({ error: 'bad token' }, { status: 400 });
  }
  const bootstrap = await loadPresentationByToken(token);
  if (!bootstrap) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  // Strip legacy SharedEstimateRecord before responding — the server page uses
  // it internally but clients don't need it (they already have the output).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { legacyRecord, ...publicShape } = bootstrap;
  return NextResponse.json({ success: true, bootstrap: publicShape });
}
