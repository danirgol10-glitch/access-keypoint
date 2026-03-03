import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeRequestDetail, useTradeRequests } from '@/hooks/useTradeRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Package, Check, X, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
    CANCELLED: { labelKey: 'trade.statusCancelled', bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' },
  };

  const statusInfo = request ? statusConfig[request.status] : null;
  const canAct = request?.status === 'SENT';
  const isReceiver = request && request.to_user_id === user?.id;
  const isSender = request && request.from_user_id === user?.id;
  const otherUserId = request?.isFromMe ? request.to_user_id : request?.from_user_id;

  const handleAccept = async () => {
    if (!requestId || !otherUserId) return;
    try {
      await updateStatus({ requestId, newStatus: 'ACCEPTED', otherUserId, otherUsername: request?.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined });
      toast.success(t('requestDetail.accepted'));
    } catch { toast.error(t('requestDetail.failAccept')); }
  };

  const confirmAction = async () => {
    if (!confirmDialog || !requestId || !otherUserId) return;
    try {
      const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED';
      await updateStatus({ requestId, newStatus, otherUserId, otherUsername: request?.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined });
      toast.success(confirmDialog.type === 'reject' ? t('requestDetail.rejected') : t('requestDetail.cancelled'));
    } catch { toast.error(t('requestDetail.failUpdate')); } finally { setConfirmDialog(null); }
  };

  return (
    <div className="flex flex-col min-h-screen page-bg">
      <header className="sticky top-0 z-10 px-4 py-3" style={{ background: 'rgba(7,28,71,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="rounded-full h-9 w-9 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <ArrowLeft className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
          <h1 className="text-[16px] font-semibold" style={{ color: '#FFFFFF' }}>{t('requestDetail.title')}</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24 max-w-md mx-auto w-full space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full rounded-[20px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <Skeleton className="h-48 w-full rounded-[20px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </>
        ) : !request ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            <Package className="h-12 w-12 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('requestDetail.notFound')}</p>
          </div>
        ) : (
          <>
            <div className="premium-panel premium-panel-gold p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('requestDetail.status')}</span>
                {statusInfo && (
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: statusInfo.bg, color: statusInfo.color }}>{t(statusInfo.labelKey)}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{request.isFromMe ? t('trade.to') : t('trade.from')}</span>
                <span className="font-medium text-[14px]" style={{ color: '#FFFFFF' }}>@{request.other_user?.username ?? t('common.unknown')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('requestDetail.created')}</span>
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {canAct && (
              <div className="premium-panel p-4 space-y-3">
                {isReceiver && (
                  <div className="flex gap-3">
                    <button onClick={handleAccept} disabled={isUpdating} className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}>
                      <Check className="h-4 w-4" />{t('requestDetail.accept')}
                    </button>
                    <button onClick={() => setConfirmDialog({ open: true, type: 'reject' })} disabled={isUpdating} className="flex-1 h-10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)' }}>
                      <X className="h-4 w-4" />{t('requestDetail.reject')}
                    </button>
                  </div>
                )}
                {isSender && (
                  <button onClick={() => setConfirmDialog({ open: true, type: 'cancel' })} disabled={isUpdating} className="w-full h-10 rounded-xl text-sm font-medium flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)' }}>
                    {t('requestDetail.cancelRequest')}
                  </button>
                )}
              </div>
            )}

            {request.status === 'ACCEPTED' && request.conversation_id && (
              <button onClick={() => navigate(`/chat/${request.conversation_id}`)} className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}>
                <MessageCircle className="h-4 w-4" />{t('requestDetail.openChat')}
              </button>
            )}

            <div className="space-y-3">
              <h2 className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{t('requestDetail.requestedStickers', { count: request.items?.length ?? 0 })}</h2>
              {request.items && request.items.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {request.items.map((item) => (
                    <div key={item.id} className="aspect-[3/4] rounded-[14px] p-2 flex flex-col items-center justify-center text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>{item.sticker?.code ?? t('common.unknown')}</span>
                      {item.sticker?.team_name && <span className="text-[10px] mt-1 truncate w-full px-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.sticker.team_name}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="premium-panel p-8 flex flex-col items-center text-center">
                  <Package className="h-12 w-12 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('requestDetail.noStickers')}</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent style={{ background: '#0A1A3A', border: '1px solid rgba(255,255,255,0.10)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#FFFFFF' }}>{confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'rgba(255,255,255,0.6)' }}>{t('requestDetail.confirmSure')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)' }}>{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}>
              {confirmDialog?.type === 'reject' ? t('requestDetail.yesReject') : t('requestDetail.yesCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequestDetail;
