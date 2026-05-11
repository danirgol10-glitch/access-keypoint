import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeRequestDetail, useTradeRequests } from '@/hooks/useTradeRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AppCard } from '@/components/ui/app-card';
import { AvatarCircle } from '@/components/ui/avatar-circle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ListRow } from '@/components/ui/list-row';
import { PageHeader } from '@/components/ui/page-header';
import { CalendarClock, Check, MessageCircle, Package, User, X } from 'lucide-react';
import { formatTimeAgoEs } from '@/lib/dateUtils';
import { toast } from 'sonner';

const RequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { profile: myProfile } = useUserProfile();
  const { data: request, isLoading } = useTradeRequestDetail(requestId);
  const { updateStatus, isUpdating } = useTradeRequests();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'reject' | 'cancel' } | null>(null);

  const statusConfig: Record<string, { labelKey: string; badgeVariant: 'secondary' | 'success' | 'destructive' }> = {
    SENT: { labelKey: 'trade.statusPending', badgeVariant: 'secondary' },
    ACCEPTED: { labelKey: 'trade.statusAccepted', badgeVariant: 'success' },
    REJECTED: { labelKey: 'trade.statusRejected', badgeVariant: 'destructive' },
    CANCELLED: { labelKey: 'trade.statusCancelled', badgeVariant: 'secondary' },
  };

  const statusInfo = request ? statusConfig[request.status] : null;
  const canAct = request?.status === 'SENT';
  const isReceiver = request && request.to_user_id === user?.id;
  const isSender = request && request.from_user_id === user?.id;
  const otherUserId = request?.isFromMe ? request.to_user_id : request?.from_user_id;

  const handleAccept = async () => {
    if (!requestId || !otherUserId) return;
    try { await updateStatus({ requestId, newStatus: 'ACCEPTED', otherUserId, otherUsername: request?.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined }); toast.success(t('requestDetail.accepted')); }
    catch { toast.error(t('requestDetail.failAccept')); }
  };

  const confirmAction = async () => {
    if (!confirmDialog || !requestId || !otherUserId) return;
    try { const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED'; await updateStatus({ requestId, newStatus, otherUserId, otherUsername: request?.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined }); toast.success(confirmDialog.type === 'reject' ? t('requestDetail.rejected') : t('requestDetail.cancelled')); }
    catch { toast.error(t('requestDetail.failUpdate')); } finally { setConfirmDialog(null); }
  };

  return (
    <div className="relative mx-auto max-w-lg space-y-4 px-4 safe-page">
      <div className="page-vignette" />
      <PageHeader title={t('requestDetail.title')} showBackButton onBack={() => navigate(-1)} className="relative z-20 px-0 pb-0 pt-0" />

      {isLoading ? (
        <div className="relative z-20 space-y-4">
          <Skeleton className="h-32 w-full rounded-[var(--radius-xl)] bg-[var(--surface-skeleton)]" />
          <Skeleton className="h-20 w-full rounded-[var(--radius-xl)] bg-[var(--surface-skeleton)]" />
          <Skeleton className="h-48 w-full rounded-[var(--radius-xl)] bg-[var(--surface-skeleton)]" />
        </div>
      ) : !request ? (
        <EmptyState
          className="relative z-20"
          icon={<Package />}
          title={t('requestDetail.notFound')}
          description={t('requestDetail.notFoundHint')}
          cta={
            <Button type="button" className="w-full" onClick={() => navigate('/trading')}>
              {t('requestDetail.backToTrading')}
            </Button>
          }
        />
      ) : (
        <>
          <AppCard variant="hero" className="relative z-20 space-y-4 p-5">
            <div className="flex items-start gap-4">
              <AvatarCircle initials={request.other_user?.username?.slice(0, 2).toUpperCase()} icon={<User />} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    {request.isFromMe ? t('trade.to') : t('trade.from')}
                  </p>
                  {statusInfo && <Badge variant={statusInfo.badgeVariant}>{t(statusInfo.labelKey)}</Badge>}
                </div>
                <h2 className="mt-2 truncate text-lg font-bold text-[var(--text-primary)]">@{request.other_user?.username ?? t('common.unknown')}</h2>
                {request.other_user?.city && (
                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                    {request.other_user.city}{request.other_user.university_name ? ` · ${request.other_user.university_name}` : ''}
                  </p>
                )}
              </div>
            </div>

            <ListRow
              leading={<CalendarClock className="h-4 w-4 text-[var(--text-secondary)]" />}
              title={t('requestDetail.created')}
              subtitle={formatTimeAgoEs(request.created_at)}
              className="bg-[var(--surface-input)]"
            />
          </AppCard>

          {canAct && (
            <AppCard className="relative z-20 space-y-3 p-4">
              {isReceiver && (
                <div className="flex gap-3">
                  <Button type="button" onClick={handleAccept} disabled={isUpdating} className="flex-1">
                    <Check className="h-4 w-4" />{t('requestDetail.accept')}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setConfirmDialog({ open: true, type: 'reject' })} disabled={isUpdating} className="flex-1">
                    <X className="h-4 w-4" />{t('requestDetail.reject')}
                  </Button>
                </div>
              )}
              {isSender && (
                <Button type="button" variant="secondary" onClick={() => setConfirmDialog({ open: true, type: 'cancel' })} disabled={isUpdating} className="w-full">
                  {t('requestDetail.cancelRequest')}
                </Button>
              )}
            </AppCard>
          )}

          {request.status === 'ACCEPTED' && request.conversation_id && (
            <Button type="button" onClick={() => navigate(`/chat/${request.conversation_id}`)} className="relative z-20 w-full">
              <MessageCircle className="h-4 w-4" />{t('requestDetail.openChat')}
            </Button>
          )}

          <section className="relative z-20 space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">{t('requestDetail.requestedStickers', { count: request.items?.length ?? 0 })}</h2>
            {request.items && request.items.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {request.items.map((item) => (
                  <div key={item.id} className="flex aspect-[3/4] flex-col items-center justify-center rounded-[14px] border border-[var(--surface-card-border)] bg-[var(--surface-card)] p-2 text-center shadow-control">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{item.sticker?.code ?? t('common.unknown')}</span>
                    {item.sticker?.team_name && <span className="mt-1 w-full truncate px-1 text-[10px] text-[var(--text-muted)]">{item.sticker.team_name}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package />}
                title={t('requestDetail.noStickers')}
                description={t('requestDetail.noStickersHint')}
                cta={
                  <Button type="button" className="w-full" onClick={() => navigate('/trading')}>
                    {t('requestDetail.backToTrading')}
                  </Button>
                }
              />
            )}
          </section>
        </>
      )}

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}</AlertDialogTitle>
            <AlertDialogDescription>{t('requestDetail.confirmSure')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="min-h-11">{confirmDialog?.type === 'reject' ? t('requestDetail.yesReject') : t('requestDetail.yesCancel')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequestDetail;
