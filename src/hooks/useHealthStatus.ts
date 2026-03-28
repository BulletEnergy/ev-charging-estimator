import { useState, useEffect } from 'react';

interface HealthServices {
  openai: boolean;
  gemini: boolean;
  monday: boolean;
  mapbox: boolean;
  mapWorkspace: boolean;
  googleMaps: boolean;
  supabase: boolean;
  aiReady: boolean;
}

interface HealthStatus {
  services: HealthServices | null;
  isLoading: boolean;
  error: boolean;
}

const DEFAULT: HealthServices = {
  openai: false,
  gemini: false,
  monday: false,
  mapbox: false,
  mapWorkspace: false,
  googleMaps: false,
  supabase: false,
  aiReady: false,
};

export function useHealthStatus(): HealthStatus {
  const [services, setServices] = useState<HealthServices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setServices(data.services ?? DEFAULT);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServices(DEFAULT);
          setError(true);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { services, isLoading, error };
}
