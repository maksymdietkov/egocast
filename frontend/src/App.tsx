import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from './hooks/useGeolocation';
import { getAdvice, ApiError } from './api/client';
import type { AdviceResponse, Period, WeatherData } from './types/weather';
import './App.css';

const DEFAULT_TONE = 'default';

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
  const { coords, status: geoStatus, error: geoError } = useGeolocation();

  const [period, setPeriod] = useState<Period>('today');
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [adviceStatus, setAdviceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (geoStatus !== 'success' || !coords) return;

    setAdviceStatus('loading');
    setExpanded(false);

    const lang = i18n.language.split('-')[0];

    getAdvice(coords, DEFAULT_TONE, lang, period)
      .then((result) => {
        setAdvice(result);
        setAdviceStatus('success');
      })
      .catch((err) => {
        console.error('Failed to fetch advice', err instanceof ApiError ? err.status : err);
        setAdviceStatus('error');
      });
  }, [coords, geoStatus, period, i18n.language]);

  if (geoStatus === 'idle' || geoStatus === 'loading') {
    return (
      <main className="screen">
        <h1 className="brand">EgoCast</h1>
        <p className="status-text">{t('loading.location')}</p>
      </main>
    );
  }

  if (geoStatus === 'error') {
    return (
      <main className="screen">
        <h1 className="brand">EgoCast</h1>
        <p className="status-text">{t(`error.${geoError}`)}</p>
      </main>
    );
  }

  return (
    <main className="screen">
      <h1 className="brand">EgoCast</h1>
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
              {Object.values(advice.expandComments).map((line, i) => (
                <p key={i}>{capitalizeSentences(line)}</p>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default App;