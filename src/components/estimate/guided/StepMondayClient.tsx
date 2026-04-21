'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEstimate } from '@/contexts/EstimateContext';
import { emptyInput } from '@/lib/estimate/emptyInput';
import type { EstimateInput } from '@/lib/estimate/types';
import type {
  ClientListEntry,
  ClientSource,
} from '@/lib/monday/mirror-schema';
import { mergeEstimateInput } from '@/lib/monday/merge-input';

interface StepMondayClientProps {
  onContinue: () => void;
}

interface ClientDetailResponse {
  estimateInput?: Partial<EstimateInput>;
  source?: ClientSource;
  sowMatched?: boolean;
  mondayItemId?: string;
  error?: string;
}

export function StepMondayClient({ onContinue }: StepMondayClientProps) {
  const { setInput } = useEstimate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<ClientListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selected, setSelected] = useState<ClientListEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch results when query changes
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/monday/clients?q=${encodeURIComponent(debouncedQuery)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (data?.disabled) {
          setDisabled(true);
          setResults([]);
          return;
        }
        setDisabled(false);
        setResults(Array.isArray(data?.clients) ? data.clients.slice(0, 20) : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load clients');
          setResults([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleLoad = useCallback(async () => {
    if (!selected) return;
    setIsApplying(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/monday/client/${encodeURIComponent(selected.id)}?source=${selected.source}`,
      );
      const data: ClientDetailResponse = await res.json();
      if (!res.ok || !data.estimateInput) {
        throw new Error(data.error ?? `Failed (${res.status})`);
      }
      const merged = mergeEstimateInput(emptyInput(), data.estimateInput);
      merged._monday = {
        itemId: selected.id,
        source: selected.source,
        sowMatched: !!data.sowMatched,
        loadedAt: new Date().toISOString(),
      };
      setInput(merged);
      onContinue();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load client');
    } finally {
      setIsApplying(false);
    }
  }, [selected, setInput, onContinue]);

  if (disabled) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monday Client</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monday integration is not configured in this environment. You can
            skip this step and enter the project manually.
          </p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="px-4 py-2 rounded-lg bg-[#13b3cf] text-white text-sm font-semibold hover:bg-[#0e9ab3]"
        >
          Continue &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Load Monday client (optional)
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Search deals and leads from Monday.com. If a matching Scope of Work
          exists, its fields will also be prefilled.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Search by name
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Acme Hotel, Hilton Garage, ..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#13b3cf] focus:border-transparent"
        />
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-sm text-gray-500">Loading...</div>
        ) : results.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">
            {debouncedQuery ? 'No clients match.' : 'Start typing to search.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map((r) => {
              const isSel = selected?.id === r.id && selected.source === r.source;
              return (
                <li key={`${r.source}-${r.id}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(r)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                      isSel ? 'bg-[#13b3cf]/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {r.name}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
                          r.source === 'deal'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {r.source}
                      </span>
                    </div>
                    {r.siteAddress && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {r.siteAddress}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip &mdash; start blank
        </button>

        <button
          type="button"
          onClick={handleLoad}
          disabled={!selected || isApplying}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            selected && !isApplying
              ? 'bg-[#13b3cf] text-white hover:bg-[#0e9ab3]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isApplying ? 'Loading...' : 'Use selected client'}
        </button>
      </div>
    </div>
  );
}
