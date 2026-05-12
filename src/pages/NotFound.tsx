import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppCard } from "@/components/ui/app-card";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Ruta no encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-screen page-bg safe-auth-screen relative flex items-center justify-center overflow-hidden px-4">
      <div className="page-vignette" />
      <AppCard variant="hero" className="relative z-20 w-full max-w-md space-y-4 p-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-[var(--trade-green-border)] bg-[var(--trade-green-soft)] text-xl font-black text-primary shadow-glow">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-[22px] font-bold text-[var(--text-primary)]">{t('notFound.title')}</h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{t('notFound.message')}</p>
        </div>
        <Button asChild className="w-full">
          <Link to="/">{t('common.backHome')}</Link>
        </Button>
      </AppCard>
    </div>
  );
};

export default NotFound;
