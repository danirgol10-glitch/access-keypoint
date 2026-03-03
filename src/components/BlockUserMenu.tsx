import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { MoreVertical, ShieldBan, ShieldCheck } from 'lucide-react';

interface BlockUserMenuProps { userId: string; username: string | null; }

export function BlockUserMenu({ userId, username }: BlockUserMenuProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isBlocked, block, unblock, isBlocking, isUnblocking } = useBlockedUsers();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const blocked = isBlocked(userId);

  const handleBlock = async () => {
    try { await block(userId); toast({ title: t('block.blocked') }); setConfirmOpen(false); navigate(-1); }
    catch { toast({ title: t('common.error'), description: t('block.failBlock'), variant: 'destructive' }); }
  };

  const handleUnblock = async () => {
    try { await unblock(userId); toast({ title: t('block.unblocked') }); }
    catch { toast({ title: t('common.error'), description: t('block.failUnblock'), variant: 'destructive' }); }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More options"><MoreVertical className="h-5 w-5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {blocked ? (
            <DropdownMenuItem onClick={handleUnblock} disabled={isUnblocking}>
              <ShieldCheck className="h-4 w-4 mr-2" />{t('block.unblockUser')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
              <ShieldBan className="h-4 w-4 mr-2" />{t('block.blockUser')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('block.confirmTitle', { username: username ?? 'this user' })}</AlertDialogTitle>
            <AlertDialogDescription>{t('block.confirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('block.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} disabled={isBlocking}>{t('block.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
