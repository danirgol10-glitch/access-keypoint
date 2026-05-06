import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeRequestDetail, useTradeRequests } from '@/hooks/useTradeRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Package, Check, X, MessageCircle } from 'lucide-react';
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

  const statusConfig: Record<string, { labelKey: string; bg: string; color: string }> = {
    SENT: { labelKey: 'trade.statusPending', bg: 'rgba(255,210,63,0.15)', color: 'hsl(45, 93%, 58%)' },
    ACCEPTED: { labelKey: 'trade.statusAccepted', bg: 'rgba(34,197,94,0.15)', color: 'hsl(142, 72%, 55%)' },
    REJECTED: { labelKey: 'trade.statusRejected', bg: 'rgba(239,68,68,0.15)', color: 'hsl(0, 84%, 60%)' },
    CANCELLED: { labelKey: 'trade.statusCancelled', bg: 'var(--surface-input)', color: 'var(--text-secondary)' },
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
    <div className="flex min-h-full flex-col page-bg">
      <header className="sticky top-0 z-10 px-4 pb-3 safe-header header-themed">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-11 w-11 flex items-center justify-center" style={{ background: 'var(--surface-input)' }}>
            <ArrowLeft className="h-5 w-5" style={{ color: 'var(--icon-default)' }} />
          </button>
          <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{t('requestDetail.title')}</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 safe-detail-bottom max-w-md mx-auto w-full space-y-4">
        {isLoading ? (
          <><Skeleton className="h-24 w-full rounded-[20px]" style={{ background: 'var(--surface-skeleton)' }} /><Skeleton className="h-48 w-full rounded-[20px]" style={{ background: 'var(--surface-skeleton)' }} /></>
        ) : !request ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            <Package className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t('requestDetail.notFound')}</p>
            <p className="text-[12px] mt-2" style={{ color: 'var(--text-hint)' }}>{t('requestDetail.notFoundHint')}</p>
            <button onClick={() => navigate('/trading')} className="mt-4 min-h-11 w-full rounded-xl text-sm font-semibold btn-themed">
              {t('requestDetail.backToTrading')}
            </button>
          </div>
        ) : (
          <>
            <div className="premium-panel premium-panel-gold p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{t('requestDetail.status')}</span>
                {statusInfo && <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: statusInfo.bg, color: statusInfo.color }}>{t(statusInfo.labelKey)}</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{request.isFromMe ? t('trade.to') : t('trade.from')}</span>
                <div className="text-right">
                  <span className="font-medium text-[14px]" style={{ color: 'var(--text-primary)' }}>@{request.other_user?.username ?? t('common.unknown')}</span>
                  {request.other_user?.city && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {request.other_user.city}{request.other_user.university_name ? ` • ${request.other_user.university_name}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{t('requestDetail.created')}</span>
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{formatTimeAgoEs(request.created_at)}</span>
              </div>
            </div>

            {canAct && (
              <div className="premium-panel p-4 space-y-3">
                {isReceiver && (
                  <div className="flex gap-3">
                    <button onClick={handleAccept} disabled={isUpdating} className="flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 btn-themed"><Check className="h-4 w-4" />{t('requestDetail.accept')}</button>
                    <button onClick={() => setConfirmDialog({ open: true, type: 'reject' })} disabled={isUpdating} className="flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}><X className="h-4 w-4" />{t('requestDetail.reject')}</button>
                  </div>
                )}
                {isSender && (
                  <button onClick={() => setConfirmDialog({ open: true, type: 'cancel' })} disabled={isUpdating} className="w-full h-11 rounded-xl text-sm font-medium flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>{t('requestDetail.cancelRequest')}</button>
                )}
              </div>
            )}

            {request.status === 'ACCEPTED' && request.conversation_id && (
              <button onClick={() => navigate(`/chat/${request.conversation_id}`)} className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] btn-themed">
                <MessageCircle className="h-4 w-4" />{t('requestDetail.openChat')}
              </button>
            )}

            <div className="space-y-3">
              <h2 className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t('requestDetail.requestedStickers', { count: request.items?.length ?? 0 })}</h2>
              {request.items && request.items.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {request.items.map((item) => (
                    <div key={item.id} className="aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center"
                      style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-card-border)' }}>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.sticker?.code ?? t('common.unknown')}</span>
                      {item.sticker?.team_name && <span className="text-[10px] mt-1 truncate w-full px-1" style={{ color: 'var(--text-muted)' }}>{item.sticker.team_name}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="premium-panel p-8 flex flex-col items-center text-center">
                  <Package className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{t('requestDetail.noStickers')}</p>
                  <p className="text-[12px] mt-2" style={{ color: 'var(--text-hint)' }}>{t('requestDetail.noStickersHint')}</p>
                  <button onClick={() => navigate('/trading')} className="mt-4 min-h-11 w-full rounded-xl text-sm font-semibold btn-themed">
                    {t('requestDetail.backToTrading')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent style={{ background: 'var(--dialog-bg)', border: '1px solid var(--surface-input-border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>{confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>{t('requestDetail.confirmSure')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="min-h-11 btn-themed">{confirmDialog?.type === 'reject' ? t('requestDetail.yesReject') : t('requestDetail.yesCancel')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequestDetail;
