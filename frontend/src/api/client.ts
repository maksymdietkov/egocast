import type { WeatherData, AdviceResponse, ToneInfo, Period, Coordinates } from '../types/weather';

const BASE_URL = '/api/v1';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}${path}?${query}`);

  if (!response.ok) {
    throw new ApiError(response.status, `Request to ${path} failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getWeather(coords: Coordinates, period: Period): Promise<WeatherData> {
  return request<WeatherData>('/weather', {
    lat: String(coords.lat),
    lon: String(coords.lon),
    period,
  });
}

export function getAdvice(
  coords: Coordinates,
  tone: string,
  lang: string,
  period: Period
): Promise<AdviceResponse> {
  return request<AdviceResponse>('/advice', {
    lat: String(coords.lat),
    lon: String(coords.lon),
    tone,
    lang,
    period,
  });
}

export function getTones(): Promise<ToneInfo[]> {
  return request<ToneInfo[]>('/tones', {});
}

export { ApiError };