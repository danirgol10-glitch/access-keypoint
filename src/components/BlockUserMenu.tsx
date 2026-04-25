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
import { toast } from '@/hooks/use-toast';
import { MoreVertical, ShieldBan, ShieldCheck, Flag } from 'lucide-react';

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
          <Button variant="ghost" size="icon" aria-label="More options"><MoreVertical className="h-5 w-5" /></Button>
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
            <AlertDialogTitle>{t('block.confirmTitle', { username: username ?? 'this user' })}</AlertDialogTitle>
            <AlertDialogDescription>{t('block.confirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('block.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} disabled={isBlocking}>{t('block.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report modal */}
      <Dialog open={reportOpen} onOpenChange={(open) => { setReportOpen(open); if (!open) { setSelectedReason(null); setReportMessage(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('report.title', { username: username ?? 'this user' })}</DialogTitle>
            <DialogDescription className="sr-only">Select a reason to report this user</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedReason(r.value)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: selectedReason === r.value
                    ? 'linear-gradient(135deg, var(--btn-gradient-from), var(--btn-gradient-to))'
                    : 'var(--surface-input)',
                  color: selectedReason === r.value ? '#FFFFFF' : 'var(--text-primary)',
                  border: `1px solid ${selectedReason === r.value ? 'transparent' : 'var(--surface-input-border)'}`,
                }}
              >
                {t(r.labelKey)}
              </button>
            ))}
            <textarea
              placeholder={t('report.optionalMessage')}
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-base outline-none resize-none"
              style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReportOpen(false)}>{t('report.cancel')}</Button>
            <Button onClick={handleReport} disabled={!selectedReason || isReporting}>{t('report.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
