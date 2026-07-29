export type Period = 'today' | 'tomorrow';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  precipitation: number;
  precipitationProbability: number;
  humidity: number;
  cloudCover: number;
  uvIndex: number;
  weatherCode: number;
  isoTime: string;
}

export interface ExpandComments {
  temp: string;
  feels_like: string;
  wind: string;
  humidity: string;
  precipitation: string;
  uv: string;
}

export interface AdviceResponse {
  advice: string;
  triggerPhrase: string;
  expandComments: ExpandComments;
  rawWeather: WeatherData;
}

export interface ToneInfo {
  id: string;
  premium: boolean;
}

export interface Coordinates {
  lat: number;
  lon: number;
}