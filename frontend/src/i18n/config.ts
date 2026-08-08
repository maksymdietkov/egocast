import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    fallbackLng: 'en',
    // Пока реальных переводов кроме en нет (см. план — русский приедет только
    // после второго тон-пака и страницы выбора тон-пака). Без этого
    // языковой детектор подставляет системный язык браузера (например 'ru')
    // прямо в i18n.language — а это летит в API-запрос как lang=ru и
    // роняет загрузку тон-пака на дефолт, потому что templates/{tone}/ru.yaml
    // ещё не существует.
    supportedLngs: ['en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;