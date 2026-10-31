import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  fetchStatsSummary,
  StatsError,
  type DailyPoint,
  type Slice,
  type StatsSummary,
} from '../api/stats';
import { toneLabel } from '../data/toneMeta';
import './StatsScreen.css';

interface StatsScreenProps {
  onBack: () => void;
}

type Status = 'loading' | 'success' | 'error';

/** 'YYYY-MM-DD' → Date в UTC, чтобы часовой пояс браузера не сдвигал день. */
function parseDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDay(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    parseDay(iso)
  );
}

function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(n);
}

/* ---------- KPI ---------- */

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stats-kpi">
      <span className="stats-kpi-value">{value}</span>
      <span className="stats-kpi-label">{label}</span>
      {hint && <span className="stats-kpi-hint">{hint}</span>}
    </div>
  );
}

/* ---------- График ---------- */

const CHART_W = 300;
const CHART_H = 120;
const GAP = 2;

/** Красивый верх шкалы: 1, 2, 5, 10, 20, 50... не меньше 4, чтобы низкие столбики не были во всю высоту. */
function niceMax(value: number): number {
  const v = Math.max(value, 4);
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const step of [1, 2, 5, 10]) {
    if (step * pow >= v) return step * pow;
  }
  return 10 * pow;
}

function DailyChart({ daily, locale }: { daily: DailyPoint[]; locale: string }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(daily.length - 1);

  if (daily.length === 0) return null;

  const max = niceMax(Math.max(...daily.map((d) => d.visitors)));
  const slot = CHART_W / daily.length;
  const barW = Math.max(slot - GAP, 1);
  const y = (v: number) => CHART_H - (v / max) * CHART_H;
  const point = daily[Math.min(selected, daily.length - 1)];

  return (
    <div className="stats-card">
      <div className="stats-card-head">
        <h3 className="stats-card-title">{t('stats.chartTitle')}</h3>
        <div className="stats-legend">
          <span>
            <i className="stats-swatch stats-swatch--returning" />
            {t('stats.returning')}
          </span>
          <span>
            <i className="stats-swatch stats-swatch--new" />
            {t('stats.new')}
          </span>
        </div>
      </div>

      <p className="stats-chart-readout" aria-live="polite">
        <strong>{formatDay(point.date, locale)}</strong>
        {' · '}
        {t('stats.dayVisitors', { count: point.visitors })}
        {point.newVisitors > 0 && ` · ${t('stats.dayNew', { count: point.newVisitors })}`}
      </p>

      <div className="stats-chart">
        <span className="stats-chart-max">{max}</span>
        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={t('stats.chartTitle')}
        >
          {[0.5, 1].map((f) => (
            <line
              key={f}
              className="stats-gridline"
              x1={0}
              x2={CHART_W}
              y1={CHART_H - CHART_H * f}
              y2={CHART_H - CHART_H * f}
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {daily.map((d, i) => {
            const x = i * slot + GAP / 2;
            const returning = d.visitors - d.newVisitors;
            const yTotal = y(d.visitors);
            const yReturningTop = y(returning);
            const active = i === selected;
            return (
              <g
                key={d.date}
                className={active ? 'stats-bar stats-bar--active' : 'stats-bar'}
                onClick={() => setSelected(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setSelected(i);
                }}
              >
                {/* невидимая зона во всю высоту — чтобы попадать пальцем и в пустые дни */}
                <rect x={i * slot} y={0} width={slot} height={CHART_H} fill="transparent" />
                {returning > 0 && (
                  <rect
                    className="stats-bar-returning"
                    x={x}
                    y={yReturningTop}
                    width={barW}
                    height={CHART_H - yReturningTop}
                  />
                )}
                {d.newVisitors > 0 && (
                  <rect
                    className="stats-bar-new"
                    x={x}
                    y={yTotal}
                    width={barW}
                    height={yReturningTop - yTotal}
                  />
                )}
                {d.visitors === 0 && (
                  <rect className="stats-bar-empty" x={x} y={CHART_H - 1} width={barW} height={1} />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="stats-chart-axis">
        <span>{formatDay(daily[0].date, locale)}</span>
        <span>{formatDay(daily[daily.length - 1].date, locale)}</span>
      </div>
    </div>
  );
}

/* ---------- Разбивки ---------- */

function Breakdown({
  title,
  slices,
  labelFor,
  locale,
}: {
  title: string;
  slices: Slice[];
  labelFor: (key: string) => string;
  locale: string;
}) {
  const { t } = useTranslation();
  const total = slices.reduce((sum, s) => sum + s.visitors, 0);

  return (
    <div className="stats-card">
      <h3 className="stats-card-title">{title}</h3>
      {total === 0 ? (
        <p className="stats-empty">{t('stats.noData')}</p>
      ) : (
        <ul className="stats-bars">
          {slices.map((s) => {
            const pct = Math.round((s.visitors / total) * 100);
            return (
              <li key={s.key} className="stats-row">
                <div className="stats-row-text">
                  <span className="stats-row-label">{labelFor(s.key)}</span>
                  <span className="stats-row-value">
                    {formatNumber(s.visitors, locale)} · {pct}%
                  </span>
                </div>
                <div className="stats-track">
                  <div className="stats-fill" style={{ width: `${Math.max(pct, 1)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Экран ---------- */

export function StatsScreen({ onBack }: StatsScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.split('-')[0];

  const [data, setData] = useState<StatsSummary | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // статус «загрузка» ставим в обработчике, а не в эффекте — так советует react-hooks
  const reload = useCallback(() => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchStatsSummary(controller.signal)
      .then((summary) => {
        setData(summary);
        setStatus('success');
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch stats', err);
        setErrorStatus(err instanceof StatsError ? err.status : null);
        setStatus('error');
      });

    return () => controller.abort();
  }, [reloadKey]);

  const unknown = t('stats.unknown');
  const toneName = (key: string) => (key === 'unknown' ? unknown : toneLabel(key));
  const langName = (key: string) => (key === 'unknown' ? unknown : key.toUpperCase());
  const platformName = (key: string) =>
    key === 'unknown' ? unknown : t(`stats.platform.${key}`, { defaultValue: key });

  const fmt = (n: number) => formatNumber(n, locale);

  return (
    <div className="stats-screen">
      <div className="stats-topbar">
        <button type="button" className="account-back" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t('account.back')}
        </button>
        <button
          type="button"
          className="stats-refresh"
          onClick={reload}
          disabled={status === 'loading'}
          aria-label={t('stats.refresh')}
        >
          <RefreshCw size={16} aria-hidden="true" className={status === 'loading' ? 'spinning' : ''} />
        </button>
      </div>

      <h2 className="account-title">{t('stats.title')}</h2>

      {status === 'loading' && !data && <p className="status-text">{t('stats.loading')}</p>}

      {status === 'error' && (
        <div className="status-text">
          <p>
            {errorStatus === 401
              ? t('stats.error401')
              : errorStatus === 403
                ? t('stats.error403')
                : t('error.generic')}
          </p>
          {errorStatus !== 401 && errorStatus !== 403 && (
            <button type="button" className="stats-retry" onClick={reload}>
              {t('action.retry')}
            </button>
          )}
        </div>
      )}

      {data && status !== 'error' && (
        <>
          <div className="stats-kpis">
            <Kpi label={t('stats.kpiToday')} value={fmt(data.visitorsToday)} />
            <Kpi label={t('stats.kpi7d')} value={fmt(data.visitors7d)} />
            <Kpi label={t('stats.kpi30d')} value={fmt(data.visitors30d)} />
            <Kpi
              label={t('stats.kpiNew30d')}
              value={fmt(data.new30d)}
              hint={t('stats.kpiReturningHint', { count: data.returning30d })}
            />
            <Kpi label={t('stats.kpiTotal')} value={fmt(data.totalVisitors)} />
            <Kpi label={t('stats.kpiUsers')} value={fmt(data.signedInUsers)} />
          </div>

          <DailyChart key={data.today} daily={data.daily} locale={locale} />

          <Breakdown title={t('stats.tones')} slices={data.tones} labelFor={toneName} locale={locale} />
          <Breakdown title={t('stats.langs')} slices={data.langs} labelFor={langName} locale={locale} />
          <Breakdown
            title={t('stats.platforms')}
            slices={data.platforms}
            labelFor={platformName}
            locale={locale}
          />

          <p className="stats-footnote">{t('stats.footnote')}</p>
        </>
      )}
    </div>
  );
}
