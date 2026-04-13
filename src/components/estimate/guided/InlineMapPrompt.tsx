'use client';

import { useEstimate } from '@/contexts/EstimateContext';
import type { ConditionalField } from '@/lib/estimate/guided-flow-config';

interface InlineMapPromptProps {
  /** Only the mapDerived fields for the current installation type */
  fields: ConditionalField[];
}

/** Safely read a nested value from an object using a dot-separated path. */
function readPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function InlineMapPrompt({ fields }: InlineMapPromptProps) {
  const { input } = useEstimate();
  const hasCoordinates = input.mapWorkspace?.siteCoordinates != null;
  const inputRecord = input as unknown as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--system-blue)]/20 bg-[var(--system-blue)]/5 p-4">
        {hasCoordinates ? (
          <p className="text-sm text-[var(--system-blue)]">
            Draw on the satellite map to auto-measure distances.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Map integration available &mdash; enter an address above to enable.
          </p>
        )}
      </div>

      {/* Placeholder for future SiteMap embed */}
      <div className="flex h-[400px] items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-400">Satellite Map</p>
          <p className="mt-1 text-xs text-gray-400">Will be embedded here</p>
        </div>
      </div>

      {/* Map-derived fields and their current values */}
      {fields.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Map-Derived Measurements
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((field) => {
              const val = readPath(inputRecord, field.fieldPath);
              const display = val !== null && val !== undefined && val !== 0 ? String(val) : '\u2014';
              return (
                <div key={field.id} className="flex items-baseline justify-between gap-2 rounded-md bg-gray-50 px-3 py-2">
                  <span className="text-xs text-gray-500">{field.label}</span>
                  <span className="text-sm font-medium text-gray-900">{display}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
