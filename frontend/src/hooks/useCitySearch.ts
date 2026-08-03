import { useState, useEffect } from 'react';
import { searchCities } from '../api/geocoding';
import type { CityResult } from '../types/weather';

const DEBOUNCE_MS = 350;

export function useCitySearch(query: string) {
  const [results, setResults] = useState<CityResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');

    const timeoutId = setTimeout(() => {
      searchCities(query)
        .then((cities) => {
          setResults(cities);
          setStatus('success');
        })
        .catch((err) => {
          console.error('City search failed', err);
          setStatus('error');
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, status };
}