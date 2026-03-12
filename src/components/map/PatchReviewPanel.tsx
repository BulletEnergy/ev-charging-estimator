'use client';

import type { PatchBatch, EstimatePatch } from '@/lib/map/types';

interface PatchReviewPanelProps {
  batch: PatchBatch | null;
  onAcceptPatch: (patchId: string) => void;
  onRejectPatch: (patchId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return `${value}`;
  if (Array.isArray(value)) return `[${value.join(', ')}]`;
  return String(value);
}

function fieldLabel(path: string): string {
  const labels: Record<string, string> = {
    'mapWorkspace.conduitDistance_ft': 'Conduit Distance',
    'mapWorkspace.feederDistance_ft': 'Feeder Distance',
    'mapWorkspace.trenchingDistance_ft': 'Trenching Distance',
    'mapWorkspace.boringDistance_ft': 'Boring Distance',
    'mapWorkspace.concreteCuttingDistance_ft': 'Concrete Cutting',
    'mapWorkspace.chargerCountFromMap': 'Charger Count (Map)',
    'mapWorkspace.siteCoordinates': 'Site Coordinates',
    'electrical.transformerRequired': 'Transformer Required',
    'electrical.switchgearRequired': 'Switchgear Required',
  };
  return labels[path] ?? path;
}

function PatchRow({
  patch,
  onAccept,
  onReject,
}: {
  patch: EstimatePatch;
  onAccept: () => void;
  onReject: () => void;
}) {
  const statusColors = {
    pending: 'border-amber-200 bg-amber-50',
    accepted: 'border-green-200 bg-green-50',
    rejected: 'border-red-200 bg-red-50',
  };

  return (
    <div
      className={`rounded-md border p-3 ${statusColors[patch.status]}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">
          {fieldLabel(patch.fieldPath)}
        </span>
        {patch.status === 'pending' && (
          <div className="flex gap-1">
            <button
              onClick={onAccept}
              className="rounded bg-green-600 px-2 py-0.5 text-xs text-white hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 hover:bg-red-200"
            >
              Reject
            </button>
          </div>
        )}
        {patch.status !== 'pending' && (
          <span
            className={`text-xs font-medium ${
              patch.status === 'accepted' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {patch.status}
          </span>
        )}
      </div>
      <div className="flex gap-2 text-xs text-gray-600">
        <span className="text-gray-400">{formatValue(patch.previousValue)}</span>
        <span className="text-gray-400">&rarr;</span>
        <span className="font-mono font-medium text-gray-900">
          {formatValue(patch.proposedValue)}
          {typeof patch.proposedValue === 'number' ? ' ft' : ''}
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{patch.reason}</div>
    </div>
  );
}

export function PatchReviewPanel({
  batch,
  onAcceptPatch,
  onRejectPatch,
  onAcceptAll,
  onRejectAll,
}: PatchReviewPanelProps) {
  if (!batch || batch.patches.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        Draw on the map to generate estimate patches
      </div>
    );
  }

  const pending = batch.patches.filter((p) => p.status === 'pending');
  const resolved = batch.patches.filter((p) => p.status !== 'pending');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Pending Changes ({pending.length})
        </div>
        {pending.length > 1 && (
          <div className="flex gap-1">
            <button
              onClick={onAcceptAll}
              className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
            >
              Accept All
            </button>
            <button
              onClick={onRejectAll}
              className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
            >
              Reject All
            </button>
          </div>
        )}
      </div>

      {pending.map((patch) => (
        <PatchRow
          key={patch.id}
          patch={patch}
          onAccept={() => onAcceptPatch(patch.id)}
          onReject={() => onRejectPatch(patch.id)}
        />
      ))}

      {resolved.length > 0 && (
        <>
          <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Resolved ({resolved.length})
          </div>
          {resolved.map((patch) => (
            <PatchRow
              key={patch.id}
              patch={patch}
              onAccept={() => {}}
              onReject={() => {}}
            />
          ))}
        </>
      )}
    </div>
  );
}
