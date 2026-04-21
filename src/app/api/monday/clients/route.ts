import { NextResponse } from 'next/server';
import { isMondayMirrorAvailable, listClients } from '@/lib/monday/mirror-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isMondayMirrorAvailable()) {
    return NextResponse.json(
      {
        clients: [],
        disabled: true,
        hint: 'Set NEXT_PUBLIC_MONDAY_MIRROR_SUPABASE_URL and NEXT_PUBLIC_MONDAY_MIRROR_SUPABASE_ANON_KEY to enable.',
      },
      { status: 200 },
    );
  }

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') ?? '';
    const clients = await listClients(q);
    return NextResponse.json({ clients });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[/api/monday/clients] failed:', message);
    return NextResponse.json(
      { clients: [], error: 'Failed to load clients from mirror.' },
      { status: 502 },
    );
  }
}
