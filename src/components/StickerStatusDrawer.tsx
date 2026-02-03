import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Check, Heart, Copy, X } from 'lucide-react';
import type { StickerStatus } from '@/hooks/useUserStickers';

interface StickerStatusDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stickerCode: string;
  currentStatus: StickerStatus | null;
  onSelectStatus: (status: StickerStatus) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function StickerStatusDrawer({
  open,
  onOpenChange,
  stickerCode,
  currentStatus,
  onSelectStatus,
  onClear,
  isLoading,
}: StickerStatusDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Set status for {stickerCode}</DrawerTitle>
          <DrawerDescription>
            Choose how to mark this sticker in your collection.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-8 space-y-2">
          <Button
            variant={currentStatus === 'HAVE' ? 'default' : 'outline'}
            className="w-full justify-start gap-2"
            onClick={() => onSelectStatus('HAVE')}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
            Mark as Have
          </Button>
          <Button
            variant={currentStatus === 'NEED' ? 'default' : 'outline'}
            className="w-full justify-start gap-2"
            onClick={() => onSelectStatus('NEED')}
            disabled={isLoading}
          >
            <Heart className="h-4 w-4" />
            Mark as Need
          </Button>
          <Button
            variant={currentStatus === 'DUPLICATE' ? 'default' : 'outline'}
            className="w-full justify-start gap-2"
            onClick={() => onSelectStatus('DUPLICATE')}
            disabled={isLoading}
          >
            <Copy className="h-4 w-4" />
            Mark as Duplicate
          </Button>
          {currentStatus && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={onClear}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              Clear status
            </Button>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
