import { NextResponse } from 'next/server';
import {
  findSowForClientName,
  getClient,
  isMondayMirrorAvailable,
} from '@/lib/monday/mirror-client';
import { normalizeMirrorRow } from '@/lib/monday/normalize';
import type { ClientSource } from '@/lib/monday/mirror-schema';

export const dynamic = 'force-dynamic';

function parseSource(raw: string | null): ClientSource {
  return raw === 'lead' ? 'lead' : 'deal';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isMondayMirrorAvailable()) {
    return NextResponse.json(
      { error: 'Monday mirror not configured' },
      { status: 501 },
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const url = new URL(request.url);
  const source = parseSource(url.searchParams.get('source'));

  try {
    const row = await getClient(id, source);
    if (!row) {
      return NextResponse.json(
        { error: `Client ${source}/${id} not found` },
        { status: 404 },
      );
    }

    const sow = row.name ? await findSowForClientName(row.name) : null;
    const estimateInput = normalizeMirrorRow(row, sow);

    return NextResponse.json({
      estimateInput,
      source,
      sowMatched: sow !== null,
      mondayItemId: id,
      _raw: { deal: row, sow },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(`[/api/monday/client/${id}] failed:`, message);
    return NextResponse.json(
      { error: 'Failed to fetch client from mirror.' },
      { status: 502 },
    );
  }
}
