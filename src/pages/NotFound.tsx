import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Ruta no encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-screen flex items-center justify-center page-bg safe-auth-screen">
      <div className="premium-panel premium-panel-gold w-full max-w-sm p-8 text-center">
        <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>{t('notFound.title')}</h1>
        <p className="mt-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{t('notFound.message')}</p>
        <Link to="/" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-semibold btn-themed">
          {t('common.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
