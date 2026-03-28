'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ViewMode = 'classic' | 'advanced';

const STORAGE_KEY = 'bulletev-view-mode';

function readViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'classic';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'advanced' ? 'advanced' : 'classic';
}

interface ViewModeContextValue {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  isAdvanced: boolean;
}

const ViewModeContext = createContext<ViewModeContextValue>({
  mode: 'classic',
  setMode: () => {},
  isAdvanced: false,
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>(readViewMode);

  const setMode = useCallback((newMode: ViewMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  return (
    <ViewModeContext.Provider value={{ mode, setMode, isAdvanced: mode === 'advanced' }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
