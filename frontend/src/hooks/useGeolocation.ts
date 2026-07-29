import { useState, useEffect } from 'react';
import type { Coordinates } from '../types/weather';

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

interface GeolocationState {
  coords: Coordinates | null;
  status: GeolocationStatus;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    status: 'idle',
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ coords: null, status: 'error', error: 'geolocation_unsupported' });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          status: 'success',
          error: null,
        });
      },
      (err) => {
        const errorCode =
          err.code === err.PERMISSION_DENIED
            ? 'geolocation_denied'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'geolocation_unavailable'
              : 'geolocation_timeout';

        setState({ coords: null, status: 'error', error: errorCode });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  return state;
}