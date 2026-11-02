import i18n from '../i18n/config';

const VISITOR_STORAGE_KEY = 'egocast.visitorId';
const TONE_STORAGE_KEY = 'egocast.tone';

export type Platform = 'web' | 'pwa' | 'twa';

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  visitors: number;
  newVisitors: number;
}

export interface Slice {
  key: string;
  visitors: number;
}

export interface StatsSummary {
  today: string;
  visitorsToday: number;
  visitors7d: number;
  visitors30d: number;
  new30d: number;
  returning30d: number;
  totalVisitors: number;
  signedInUsers: number;
  daily: DailyPoint[];
  tones: Slice[];
  langs: Slice[];
  platforms: Slice[];
}

export class StatsError extends Error {
  status: number;

  constructor(status: number) {
    super(`stats/summary failed: ${status}`);
    this.name = 'StatsError';
    this.status = status;
  }
}

let sent = false; // StrictMode в dev дёргает эффекты дважды — шлём один раз за загрузку страницы

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // запасной вариант для старых браузеров: UUID v4 на Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Анонимный id браузера: живёт в localStorage, без него — новый на каждую загрузку. */
function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing) return existing;
    const id = randomId();
    localStorage.setItem(VISITOR_STORAGE_KEY, id);
    return id;
  } catch {
    return randomId();
  }
}

function readTone(): string {
  try {
    return localStorage.getItem(TONE_STORAGE_KEY) ?? 'default';
  } catch {
    return 'default';
  }
}

export function detectPlatform(): Platform {
  if (document.referrer.startsWith('android-app://')) return 'twa';
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone ? 'pwa' : 'web';
}

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|scanner|python|curl|wget|phantom|selenium|puppeteer|playwright/i;
const VISIBLE_MS_REQUIRED = 8000;
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;

function looksAutomated(): boolean {
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  return BOT_UA.test(navigator.userAgent);
}

function sendVisit(): void {
  const body = JSON.stringify({
    visitorId: getVisitorId(),
    tone: readTone(), // читаем в момент отправки — юзер мог успеть сменить тон
    lang: (i18n.language || 'en').split('-')[0],
    platform: detectPlatform(),
  });

  fetch('/api/v1/stats/visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // офлайн / бек недоступен — просто пропускаем
  });
}

/**
 * Отметить визит, но только когда на странице реально человек:
 * первое касание / клик / скролл / клавиша ИЛИ вкладка была видима суммарно 8 секунд.
 * Сканеры рендерят страницу пару секунд и уходят без взаимодействия — их не считаем.
 * Ошибки глотаем — статистика никогда не должна ломать приложение.
 */
export function trackVisit(): void {
  if (sent) return;
  sent = true;
  if (looksAutomated()) return;

  let done = false;
  let visibleMs = 0;
  let visibleSince: number | null = document.visibilityState === 'visible' ? Date.now() : null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, fire, true));
    document.removeEventListener('visibilitychange', onVisibility);
  };

  function fire() {
    if (done) return;
    done = true;
    cleanup();
    sendVisit();
  }

  function armTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fire, Math.max(0, VISIBLE_MS_REQUIRED - visibleMs));
  }

  function onVisibility() {
    if (document.visibilityState === 'visible') {
      visibleSince = Date.now();
      armTimer();
    } else {
      if (visibleSince !== null) visibleMs += Date.now() - visibleSince;
      visibleSince = null;
      if (timer) clearTimeout(timer);
    }
  }

  INTERACTION_EVENTS.forEach((e) => window.addEventListener(e, fire, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
  if (visibleSince !== null) armTimer();
}

/** Сводка для админа. 401 — не залогинен, 403 — не админ. */
export async function fetchStatsSummary(signal?: AbortSignal): Promise<StatsSummary> {
  const res = await fetch('/api/v1/stats/summary', { signal, cache: 'no-store' });
  if (!res.ok) throw new StatsError(res.status);
  return res.json();
}