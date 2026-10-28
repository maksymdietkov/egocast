import { useTranslation } from 'react-i18next';

export function AppInfo() {
  const { t } = useTranslation();

  return (
    <footer className="app-info">
      <h2 className="app-info-title">{t('info.title')}</h2>
      <p>{t('info.about')}</p>
      <p>{t('info.signIn')}</p>
      <p>
        <a href="/privacy.html">{t('info.privacy')}</a>
      </p>
    </footer>
  );
}