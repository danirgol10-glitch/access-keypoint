import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface QuickDuplicateOnboardingProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function QuickDuplicateOnboarding({ open, onStart, onSkip }: QuickDuplicateOnboardingProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{t('onboarding.title')}</DialogTitle>
          <DialogDescription>
            {t('onboarding.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onStart} className="min-h-11 w-full">
            {t('onboarding.markNow')}
          </Button>
          <Button variant="ghost" onClick={onSkip} className="min-h-11 w-full">
            {t('onboarding.skip')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
