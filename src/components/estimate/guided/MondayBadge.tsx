'use client';

import { useEstimate } from '@/contexts/EstimateContext';

/**
 * Small chip shown at the top of steps 1+ when a Monday deal/lead has been
 * loaded. Clicking Unload clears only the _monday metadata — the prefilled
 * field values remain (the user may have edited them already).
 */
export function MondayBadge() {
  const { input, setInput } = useEstimate();
  const meta = input._monday;
  if (!meta) return null;

  const handleUnload = () => {
    const next = { ...input };
    delete next._monday;
    setInput(next);
  };

  const name =
    input.project?.name ||
    input.customer?.companyName ||
    `Monday ${meta.source} ${meta.itemId}`;

  return (
    <div className="mb-3 flex items-center justify-between gap-2 text-xs rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
      <span className="truncate text-emerald-800">
        <span className="font-medium">Loaded:</span> {name}
        <span className="ml-2 text-emerald-600">
          ({meta.source}
          {meta.sowMatched ? ' + SOW' : ''})
        </span>
      </span>
      <button
        type="button"
        onClick={handleUnload}
        className="text-emerald-700 hover:text-emerald-900 font-medium whitespace-nowrap"
      >
        Unload
      </button>
    </div>
  );
}
