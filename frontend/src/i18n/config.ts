import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import ru from '../locales/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    // Держим этот список в синхроне с тем, что реально переведено (UI-строки
    // здесь + templates/{tone}/{lang}.yaml на бэкенде). Раньше detector мог
    // подставить произвольный язык браузера в i18n.language, что летело в
    // API как lang=<что угодно> и роняло загрузку тон-пака на дефолт —
    // supportedLngs держит это под контролем.
    supportedLngs: ['en', 'ru'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;