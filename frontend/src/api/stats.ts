import i18n from '../i18n/config';

const VISITOR_STORAGE_KEY = 'egocast.visitorId';
const TONE_STORAGE_KEY = 'egocast.tone';

export type Platform = 'web' | 'pwa' | 'twa';

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

/** Отметить визит. Ошибки глотаем — статистика никогда не должна ломать приложение. */
export function trackVisit(): void {
  if (sent) return;
  sent = true;

  const body = JSON.stringify({
    visitorId: getVisitorId(),
    tone: readTone(),
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
