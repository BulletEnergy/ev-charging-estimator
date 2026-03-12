'use client';

import { ReactNode } from 'react';
import { ViewModeProvider } from '@/lib/viewMode';

export function Providers({ children }: { children: ReactNode }) {
  return <ViewModeProvider>{children}</ViewModeProvider>;
}
