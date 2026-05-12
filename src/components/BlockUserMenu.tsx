import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useReports, ReportReason } from '@/hooks/useReports';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { MoreVertical, ShieldBan, ShieldCheck, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockUserMenuProps { userId: string; username: string | null; }

const REPORT_REASONS: { value: ReportReason; labelKey: string }[] = [
  { value: 'spam', labelKey: 'report.spam' },
  { value: 'inappropriate', labelKey: 'report.inappropriate' },
  { value: 'scam', labelKey: 'report.scam' },
  { value: 'other', labelKey: 'report.other' },
];

export function BlockUserMenu({ userId, username }: BlockUserMenuProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isBlocked, block, unblock, isBlocking, isUnblocking } = useBlockedUsers();
  const { report, isReporting } = useReports();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const blocked = isBlocked(userId);
  const displayUsername = username ?? t('common.unknown');

  const handleBlock = async () => {
    try { await block(userId); toast({ title: t('block.blocked') }); setConfirmOpen(false); navigate(-1); }
    catch { toast({ title: t('common.error'), description: t('block.failBlock'), variant: 'destructive' }); }
  };

  const handleUnblock = async () => {
    try { await unblock(userId); toast({ title: t('block.unblocked') }); }
    catch { toast({ title: t('common.error'), description: t('block.failUnblock'), variant: 'destructive' }); }
  };

  const handleReport = async () => {
    if (!selectedReason) return;
    try {
      await report({ reportedUserId: userId, reason: selectedReason, optionalMessage: reportMessage.trim() || undefined });
      toast({ title: t('report.success'), description: t('report.successDesc') });
      setReportOpen(false);
      setSelectedReason(null);
      setReportMessage('');
    } catch {
      toast({ title: t('common.error'), description: t('report.fail'), variant: 'destructive' });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-11 w-11" aria-label="Más opciones"><MoreVertical className="h-5 w-5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4 mr-2" />{t('report.reportUser')}
          </DropdownMenuItem>
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

      {/* Block confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('block.confirmTitle', { username: displayUsername })}</AlertDialogTitle>
            <AlertDialogDescription>{t('block.confirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">{t('block.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} disabled={isBlocking} className="min-h-11">{t('block.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report modal */}
      <Dialog open={reportOpen} onOpenChange={(open) => { setReportOpen(open); if (!open) { setSelectedReason(null); setReportMessage(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('report.title', { username: displayUsername })}</DialogTitle>
            <DialogDescription className="sr-only">Selecciona un motivo para reportar a este usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {REPORT_REASONS.map((r) => (
              <Button
                key={r.value}
                type="button"
                variant={selectedReason === r.value ? 'default' : 'outline'}
                onClick={() => setSelectedReason(r.value)}
                className={cn('w-full justify-start text-left', selectedReason === r.value && 'shadow-glow')}
              >
                {t(r.labelKey)}
              </Button>
            ))}
            <Textarea
              placeholder={t('report.optionalMessage')}
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setReportOpen(false)}>{t('report.cancel')}</Button>
            <Button type="button" className="min-h-11" onClick={handleReport} disabled={!selectedReason || isReporting}>{t('report.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
