'use client';

import { useState, useRef, useCallback } from 'react';
import type { PhotoAnalysisResponse, AnalysisFile } from '@/lib/ai/types';

interface PhotoAnalysisProps {
  onApplyFields: (fields: Record<string, unknown>) => void;
}

interface FilePreview {
  file: File;
  dataUrl: string;
  base64: string;
  mimeType: string;
  fileName: string;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];
const MAX_FILES = 10;

export function PhotoAnalysis({ onApplyFields }: PhotoAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const newPreviews: FilePreview[] = [];

    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      const dataUrl = await readFileAsDataUrl(file);
      const base64 = dataUrl.split(',')[1];
      newPreviews.push({
        file,
        dataUrl,
        base64,
        mimeType: file.type,
        fileName: file.name,
      });
    }

    setPreviews((prev) => {
      const combined = [...prev, ...newPreviews];
      return combined.slice(0, MAX_FILES);
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  async function handleAnalyze() {
    if (previews.length === 0) return;
    setLoading(true);
    setError('');
    setResult(null);

    const files: AnalysisFile[] = previews.map((p) => ({
      base64: p.base64,
      mimeType: p.mimeType,
      fileName: p.fileName,
    }));

    try {
      const res = await fetch('/api/ai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed');
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
    if (!result?.inferredFields) return;
    const flat = flattenFields(result.inferredFields as Record<string, unknown>);
    onApplyFields(flat);
    setCollapsed(true);
  }

  function handleClear() {
    setResult(null);
    setPreviews([]);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-200 px-2 py-0.5 text-xs font-bold text-blue-800">GPT-5</span>
          <span className="font-medium text-gray-900">Photo &amp; Document Analysis</span>
          {result && (
            <span className="text-xs text-green-600">
              Analyzed ({Math.round(result.confidence * 100)}%)
            </span>
          )}
          {previews.length > 0 && !result && (
            <span className="text-xs text-blue-600">{previews.length} file{previews.length > 1 ? 's' : ''}</span>
          )}
        </div>
        <span className="text-gray-400">{collapsed ? '+' : '-'}</span>
      </button>

      {!collapsed && (
        <div className="border-t border-blue-100 px-4 py-4 space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
            }}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 cursor-pointer hover:border-blue-400 transition"
          >
            <svg className="mb-2 h-8 w-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            <p className="text-sm font-medium text-blue-700">
              Drop site photos &amp; PDFs here
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to browse — JPEG, PNG, WebP, GIF, PDF (up to {MAX_FILES} files)
            </p>
          </div>

          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
            }}
          />

          {/* File previews */}
          {previews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-700">
                  {previews.length} file{previews.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : `Analyze ${previews.length > 1 ? 'All' : ''}`}
                  </button>
                  {!loading && (
                    <button
                      onClick={handleClear}
                      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {previews.map((p, i) => (
                  <div key={i} className="group relative">
                    {p.mimeType === 'application/pdf' ? (
                      <div className="flex h-20 w-20 items-center justify-center rounded border border-gray-200 bg-red-50 text-xs font-medium text-red-700">
                        <div className="text-center">
                          <svg className="mx-auto mb-1 h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                          </svg>
                          PDF
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.dataUrl}
                        alt={p.fileName}
                        className="h-20 w-20 rounded border border-gray-200 object-cover"
                      />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-0.5 text-white shadow group-hover:block"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="mt-0.5 max-w-[80px] truncate text-[10px] text-gray-500" title={p.fileName}>
                      {p.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing {previews.length} file{previews.length > 1 ? 's' : ''} with GPT-5.4...
            </div>
          )}

          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Analysis Results</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApply}
                    className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Apply to Form
                  </button>
                  <button
                    onClick={handleClear}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700">{result.siteDescription}</p>

              {result.fileNotes && result.fileNotes.length > 0 && (
                <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2">
                  <p className="text-xs font-medium text-blue-800">Per-file notes:</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-blue-700">
                    {result.fileNotes.map((fn, i) => (
                      <li key={i}>
                        <span className="font-medium">{fn.fileName}:</span> {fn.note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.concerns.length > 0 && (
                <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-xs font-medium text-amber-800">Concerns:</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-amber-700">
                    {result.concerns.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <pre className="max-h-40 overflow-auto rounded bg-gray-900 p-3 text-xs text-green-400">
                {JSON.stringify(result.inferredFields, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function flattenFields(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenFields(value as Record<string, unknown>, fullKey));
    } else if (value !== null && value !== undefined) {
      result[fullKey] = value;
    }
  }
  return result;
}
