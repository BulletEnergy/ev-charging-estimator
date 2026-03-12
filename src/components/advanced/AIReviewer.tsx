'use client';

import { useState } from 'react';
import { EstimateInput, EstimateOutput } from '@/lib/estimate/types';
import { ReviewEstimateResponse } from '@/lib/ai/types';

interface AIReviewerProps {
  input: EstimateInput;
  output: EstimateOutput;
  onApplyChange: (field: string, value: unknown) => void;
}

export function AIReviewer({ input, output, onApplyChange }: AIReviewerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewEstimateResponse | null>(null);
  const [error, setError] = useState('');

  async function handleReview() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/review-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, output }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Review failed');
        return;
      }

      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const severityColor = {
    critical: 'border-red-300 bg-red-50 text-red-800',
    warning: 'border-amber-300 bg-amber-50 text-amber-800',
    info: 'border-blue-300 bg-blue-50 text-blue-800',
  };

  const badgeColor = {
    critical: 'bg-red-200 text-red-800',
    warning: 'bg-amber-200 text-amber-800',
    info: 'bg-blue-200 text-blue-800',
  };

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800">QA</span>
          <span className="font-medium text-gray-900">AI Estimate Review</span>
        </div>
        <button
          onClick={handleReview}
          disabled={loading}
          className="rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Reviewing...' : result ? 'Re-Review' : 'Review with AI'}
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="px-4 py-4 space-y-4">
          <p className="text-sm text-gray-700">{result.overallAssessment}</p>

          {result.findings.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Findings</p>
              {result.findings.map((f, i) => (
                <div key={i} className={`rounded border px-3 py-2 ${severityColor[f.severity]}`}>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-bold uppercase ${badgeColor[f.severity]}`}>
                      {f.severity}
                    </span>
                    <span className="text-xs text-gray-500">{f.category}</span>
                  </div>
                  <p className="mt-1 text-sm">{f.message}</p>
                </div>
              ))}
            </div>
          )}

          {result.suggestedChanges.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Suggested Changes</p>
              {result.suggestedChanges.map((c, i) => (
                <div key={i} className="flex items-start justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-xs font-mono text-gray-600">{c.field}</p>
                    <p className="text-sm text-gray-900">{c.reason}</p>
                    <p className="text-xs text-gray-500">
                      {String(c.currentValue ?? 'empty')} → <strong>{String(c.suggestedValue)}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => onApplyChange(c.field, c.suggestedValue)}
                    className="ml-2 shrink-0 rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
