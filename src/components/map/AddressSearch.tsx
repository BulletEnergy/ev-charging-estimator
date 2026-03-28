'use client';

import { useState, useCallback, useRef } from 'react';

interface AddressSearchProps {
  onAddressSelect: (address: string, coordinates: [number, number]) => void;
  initialAddress?: string;
}

interface GeocodingResult {
  place_name: string;
  center: [number, number];
}

const DEBOUNCE_MS = 350;

export function AddressSearch({ onAddressSelect, initialAddress }: AddressSearchProps) {
  const [query, setQuery] = useState(initialAddress ?? '');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.length < 3) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${token}&country=us&types=address,poi&limit=5`,
          );
          const data = await res.json();
          setResults(
            (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
              place_name: f.place_name,
              center: f.center,
            })),
          );
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, DEBOUNCE_MS);
    },
    [],
  );

  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      setQuery(result.place_name);
      setResults([]);
      onAddressSelect(result.place_name, result.center);
    },
    [onAddressSelect],
  );

  return (
    <div className="relative">
      <label className="mb-1 block text-xs font-medium text-gray-600">
        Site Address
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        placeholder="Search address..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      {isSearching && (
        <div className="absolute right-3 top-8 text-xs text-gray-400">Searching...</div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={`${r.center[0]},${r.center[1]}`}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
              >
                {r.place_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
