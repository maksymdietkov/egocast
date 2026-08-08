import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, User, MapPin, Share2, Thermometer, Wind, Droplets, CloudRain, Sun, type LucideIcon } from 'lucide-react';
import { useGeolocation } from './hooks/useGeolocation';
import { getAdvice, ApiError } from './api/client';
import { CitySearch } from './components/CitySearch';
import type { AdviceResponse, Period, WeatherData, Coordinates } from './types/weather';
import './App.css';

const DEFAULT_TONE = 'default';

const TONE_LABELS: Record<string, string> = {
  default: 'Classic',
};

const EXPAND_ICONS: Record<string, LucideIcon> = {
  temp: Thermometer,
  feels_like: Thermometer,
  wind: Wind,
  humidity: Droplets,
  precipitation: CloudRain,
  uv: Sun,
};

function capitalizeSentences(text: string): string {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
}

function catMood(w: WeatherData): string {
  if (w.weatherCode >= 95 && w.weatherCode <= 99) return '🙀'; // storm
  if (w.weatherCode >= 71 && w.weatherCode <= 77) return '😾'; // snow
  if (w.precipitation > 5) return '😿'; // heavy rain
  if (w.precipitation > 1) return '😾'; // rain
  if (w.temperature < 0) return '🙀'; // frost
  if (w.temperature < 13) return '😾'; // cold/chilly
  if (w.temperature < 22) return '😼'; // cool/mild
  if (w.temperature < 26) return '😺'; // comfortable
  if (w.temperature < 30) return '😸'; // warm
  return '😹'; // hot
}

function App() {
  const { t, i18n } = useTranslation();
  const { coords: geoCoords, status: geoStatus, error: geoError } = useGeolocation();

  const [manualCoords, setManualCoords] = useState<Coordinates | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('today');
  const [tone] = useState<string>(DEFAULT_TONE);
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [adviceStatus, setAdviceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [expanded, setExpanded] = useState(false);

  const coords = manualCoords ?? geoCoords;
  const hasLocation = coords !== null;

  useEffect(() => {
    if (!hasLocation || !coords) return;

    setAdviceStatus('loading');
    setExpanded(false);

    const lang = i18n.language.split('-')[0];

    getAdvice(coords, tone, lang, period)
      .then((result) => {
        setAdvice(result);
        setAdviceStatus('success');
      })
      .catch((err) => {
        console.error('Failed to fetch advice', err instanceof ApiError ? err.status : err);
        setAdviceStatus('error');
      });
  }, [coords, hasLocation, period, tone, i18n.language]);

  function handleManualCitySelect(newCoords: Coordinates, label: string) {
    setManualCoords(newCoords);
    setLocationLabel(label);
    setLocationPickerOpen(false);
  }

  if (!hasLocation && (geoStatus === 'idle' || geoStatus === 'loading')) {
    return (
      <main className="screen">
        <h1 className="brand">EgoCast</h1>
        <p className="status-text">{t('loading.location')}</p>
      </main>
    );
  }

  if (!hasLocation && geoStatus === 'error') {
    return (
      <main className="screen">
        <h1 className="brand">EgoCast</h1>
        <p className="status-text">{t(`error.${geoError}`)}</p>
        <CitySearch onSelect={handleManualCitySelect} />
      </main>
    );
  }

  if (locationPickerOpen) {
    return (
      <main className="screen">
        <CitySearch onSelect={handleManualCitySelect} onBack={() => setLocationPickerOpen(false)} />
      </main>
    );
  }

  const currentLangLabel = i18n.language.split('-')[0].toUpperCase();
  const currentToneLabel = TONE_LABELS[tone] ?? tone;
  const displayedLocation = locationLabel ?? 'My location';

  return (
    <main className="screen">
      <div className="app-header">
        <button type="button" className="header-pill" onClick={() => {/* TODO: language picker */}}>
          <Globe size={14} aria-hidden="true" />
          {currentLangLabel}
        </button>

        <div className="header-header-right">
          <button type="button" className="header-pill" onClick={() => {/* TODO: tone-pack picker */}}>
            {currentToneLabel}
            <ChevronDown size={12} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="account-button"
            aria-label={t('action.account')}
            onClick={() => {/* TODO: personal account / premium */}}
          >
            <User size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <h1 className="brand">EgoCast</h1>

      <button type="button" className="location-pill" onClick={() => setLocationPickerOpen(true)}>
        <MapPin size={12} aria-hidden="true" />
        {displayedLocation}
        <ChevronDown size={10} aria-hidden="true" />
      </button>

      <div className="period-switch">
        <button
          type="button"
          className={period === 'today' ? 'active' : ''}
          onClick={() => setPeriod('today')}
        >
          {t('period.today')}
        </button>
        <button
          type="button"
          className={period === 'tomorrow' ? 'active' : ''}
          onClick={() => setPeriod('tomorrow')}
        >
          {t('period.tomorrow')}
        </button>
      </div>

      <div className="cat-mascot" aria-hidden="true">
        {advice ? catMood(advice.rawWeather) : '🐱'}
      </div>

      {adviceStatus === 'loading' && <p className="status-text">{t('loading.weather')}</p>}

      {adviceStatus === 'error' && (
        <div className="status-text">
          <p>{t('error.generic')}</p>
          <button type="button" onClick={() => setPeriod((p) => p)}>
            {t('action.retry')}
          </button>
        </div>
      )}

      {adviceStatus === 'success' && advice && (
        <>
          <p className="advice-text">{advice.advice}</p>

          <button type="button" className="expand-toggle" onClick={() => setExpanded((e) => !e)}>
            {capitalizeSentences(advice.triggerPhrase)}
          </button>

          {expanded && (
            <div className="expand-card">
              {Object.entries(advice.expandComments).map(([key, line]) => {
                const Icon = EXPAND_ICONS[key];
                return (
                  <p key={key} className="expand-line">
                    {Icon && <Icon className="expand-icon" size={16} aria-hidden="true" />}
                    <span>{capitalizeSentences(line)}</span>
                  </p>
                );
              })}
            </div>
          )}

          <div className="ad-slot">{t('ad.placeholder')}</div>

          <div className="share-toggle-wrap">
            <button type="button" className="share-toggle" onClick={() => {/* TODO: share via html2canvas */}}>
              <Share2 size={16} aria-hidden="true" />
              <span>{t('action.share')}</span>
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default App;