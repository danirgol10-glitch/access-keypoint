import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface QuickDuplicateOnboardingProps {
  open: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function QuickDuplicateOnboarding({ open, onStart, onSkip }: QuickDuplicateOnboardingProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Start Trading Faster</DialogTitle>
          <DialogDescription>
            Mark your duplicate stickers. Only duplicates appear in the marketplace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onStart} className="w-full">
            Mark duplicates now
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full">
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
