import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from './hooks/useGeolocation';
import { getAdvice, ApiError } from './api/client';
import type { AdviceResponse, Period } from './types/weather';
import './App.css';

const DEFAULT_TONE = 'default';

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
        🐱
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
            {advice.triggerPhrase}
          </button>

          {expanded && (
            <div className="expand-card">
              {Object.values(advice.expandComments).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default App;