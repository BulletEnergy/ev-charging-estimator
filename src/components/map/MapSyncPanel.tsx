'use client';

import { useMemo } from 'react';
import type { EstimateInput } from '@/lib/estimate/types';
import type { MapWorkspaceState, EstimatePatch } from '@/lib/map/types';
import { FIELD_MAPPINGS } from '@/lib/map/constants';
import { computeFieldMappingValue, deepGet } from '@/lib/map/sync';

interface MapSyncPanelProps {
  mapState: MapWorkspaceState;
  input: EstimateInput;
  patches: readonly EstimatePatch[];
}

type SyncStatus = 'empty' | 'pending' | 'synced' | 'stale';

const STATUS_LABEL: Record<SyncStatus, string> = {
  empty: 'No map data',
  pending: 'Pending review',
  synced: 'Synced',
  stale: 'Out of sync',
};

const STATUS_CLASS: Record<SyncStatus, string> = {
  empty: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-800',
  synced: 'bg-emerald-100 text-emerald-800',
  stale: 'bg-red-100 text-red-700',
};

export function MapSyncPanel({ mapState, input, patches }: MapSyncPanelProps) {
  const rows = useMemo(() => {
    const seen = new Set<string>();
    return FIELD_MAPPINGS
      .filter((mapping) => {
        if (seen.has(mapping.fieldPath)) return false;
        seen.add(mapping.fieldPath);
        return true;
      })
      .map((mapping) => {
        const mapValue = computeFieldMappingValue(mapping, mapState);
        const estimateValue = deepGet(input, mapping.fieldPath);
        const pendingPatch = patches.find(
          (p) => p.fieldPath === mapping.fieldPath && p.status === 'pending',
        );

        let status: SyncStatus;
        if (mapValue == null) {
          status = 'empty';
        } else if (pendingPatch) {
          status = 'pending';
        } else if (mapValue === estimateValue) {
          status = 'synced';
        } else {
          status = 'stale';
        }

        return {
          mapping,
          mapValue,
          estimateValue,
          status,
        };
      })
      .filter((row) => {
        if (row.status === 'empty') {
          // Only show empty rows if the estimate already has a value to compare
          return row.estimateValue != null;
        }
        return true;
      });
  }, [input, mapState, patches]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-500">
        Draw equipment or runs to see how they post into the estimate.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Map Posting Status
        </div>
        <span className="text-[11px] text-gray-400">
          {rows.filter((r) => r.status === 'synced').length} synced ·{' '}
          {rows.filter((r) => r.status === 'pending').length} pending
        </span>
      </div>

      <div className="space-y-2">
        {rows.map(({ mapping, mapValue, estimateValue, status }) => (
          <div
            key={mapping.fieldPath}
            className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-gray-800">
                  {mapping.displayLabel ?? mapping.fieldPath}
                </div>
                {mapping.impact && (
                  <div className="text-[11px] text-gray-500">
                    {mapping.impact}
                  </div>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_CLASS[status]}`}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[12px] font-mono">
              <span className="text-indigo-700">
                Map: {formatValue(mapValue, mapping.unit)}
              </span>
              <span className="text-gray-600">
                Estimate: {formatValue(estimateValue, mapping.unit)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(value: unknown, unit?: string): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
    });
    const formatted = formatter.format(value);
    if (!unit) return formatted;
    if (unit === 'ft') return `${formatted} ft`;
    if (unit === 'ea') return `${formatted} ea`;
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value);
}
