import { ArrowLeft, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GOOGLE_LOGIN_URL, type AuthUser } from '../api/auth';

interface AccountScreenProps {
  user: AuthUser | null;
  loading: boolean;
  onBack: () => void;
  onLogout: () => void;
}

export function AccountScreen({ user, loading, onBack, onLogout }: AccountScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="account-screen">
      <button type="button" className="account-back" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        {t('account.back')}
      </button>

      <h2 className="account-title">{t('account.title')}</h2>

      {!loading && user && (
        <>
          {user.pictureUrl && (
            <img
              className="account-avatar"
              src={user.pictureUrl}
              alt=""
              referrerPolicy="no-referrer"
            />
          )}
          {user.name && <p className="account-name">{user.name}</p>}
          <p className="account-email">{user.email}</p>
          <button type="button" className="account-logout" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            {t('account.signOut')}
          </button>
        </>
      )}

      {!loading && !user && (
        <a className="google-btn" href={GOOGLE_LOGIN_URL}>
          {t('account.signIn')}
        </a>
      )}
    </div>
  );
}