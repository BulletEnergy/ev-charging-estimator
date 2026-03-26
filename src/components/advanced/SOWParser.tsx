'use client';

import { useState } from 'react';
import { SOWParseResponse } from '@/lib/ai/types';

interface SOWParserProps {
  onApplyFields: (fields: Record<string, unknown>) => void;
}

export function SOWParser({ onApplyFields }: SOWParserProps) {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SOWParseResponse | null>(null);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  async function handleParse() {
    if (!rawText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/parse-sow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Parse failed');
        return;
      }

      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!result?.parsedInput) return;
    const flat = flattenInput(result.parsedInput);
    if (result.rawLineItems && result.rawLineItems.length > 0) {
      flat.rawLineItems = result.rawLineItems;
    }
    onApplyFields(flat);
    setCollapsed(true);
  }

  return (
    <div className="rounded-lg border-2 border-purple-200 bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="rounded bg-purple-200 px-2 py-0.5 text-xs font-bold text-purple-800">NLP</span>
          <span className="font-medium text-gray-900">SOW Parser</span>
          {result && <span className="text-xs text-green-600">Parsed ({Math.round(result.confidence * 100)}% confidence)</span>}
        </div>
        <span className="text-gray-400">{collapsed ? '+' : '-'}</span>
      </button>

      {!collapsed && (
        <div className="border-t border-purple-100 px-4 py-4 space-y-4">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste the project scope of work, email, or description here..."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm min-h-[120px] focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <div className="flex gap-2">
            <button
              onClick={handleParse}
              disabled={loading || !rawText.trim()}
              className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Parsing...' : 'Parse SOW'}
            </button>
          </div>

          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Extracted Fields ({result.missingFields.length} missing)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApply}
                    className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Apply to Form
                  </button>
                  <button
                    onClick={() => setResult(null)}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <pre className="max-h-60 overflow-auto rounded bg-gray-900 p-3 text-xs text-green-400">
                {JSON.stringify(result.parsedInput, null, 2)}
              </pre>

              {result.rawLineItems && result.rawLineItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Imported line items ({result.rawLineItems.length})
                    {result.sowFormat ? ` — ${result.sowFormat}` : ''}
                  </p>
                  <div className="max-h-48 overflow-auto rounded border border-gray-200 bg-gray-50 text-xs">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="px-2 py-1">Qty</th>
                          <th className="px-2 py-1">Unit</th>
                          <th className="px-2 py-1">$</th>
                          <th className="px-2 py-1">Amount</th>
                          <th className="px-2 py-1">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.rawLineItems.map((row, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="px-2 py-1 tabular-nums">{row.quantity}</td>
                            <td className="px-2 py-1">{row.unit}</td>
                            <td className="px-2 py-1 tabular-nums">${row.unitPrice.toLocaleString()}</td>
                            <td className="px-2 py-1 tabular-nums font-medium">${row.amount.toLocaleString()}</td>
                            <td className="px-2 py-1 text-gray-700">{row.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.assumptions.length > 0 && (
                <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs font-medium text-amber-800">Assumptions:</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-amber-700">
                    {result.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              {result.missingFields.length > 0 && (
                <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="text-xs font-medium text-blue-800">Missing fields (fill manually):</p>
                  <p className="mt-1 text-xs text-blue-700">{result.missingFields.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function flattenInput(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenInput(value as Record<string, unknown>, fullKey));
    } else if (value !== null && value !== undefined) {
      result[fullKey] = value;
    }
  }
  return result;
}
