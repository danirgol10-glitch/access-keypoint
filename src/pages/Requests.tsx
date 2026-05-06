import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { TradeRequestCard } from '@/components/TradeRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Inbox, Send } from 'lucide-react';
import { toast } from 'sonner';

const Requests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { sentRequests, receivedRequests, isLoading, updateStatus, isUpdating } = useTradeRequests();
  const { profile: myProfile } = useUserProfile();

  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'reject' | 'cancel'; requestId: string; otherUserId: string; otherUsername?: string; } | null>(null);

  const handleRequestClick = (requestId: string) => navigate(`/request/${requestId}`);
  const handleAccept = async (requestId: string, request: typeof receivedRequests[0]) => {
    try { await updateStatus({ requestId, newStatus: 'ACCEPTED', otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined }); toast.success('Solicitud aceptada'); }
    catch { toast.error('Error al aceptar la solicitud'); }
  };
  const handleReject = (requestId: string, request: typeof receivedRequests[0]) => { setConfirmDialog({ open: true, type: 'reject', requestId, otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined }); };
  const handleCancel = (requestId: string, request: typeof sentRequests[0]) => { setConfirmDialog({ open: true, type: 'cancel', requestId, otherUserId: request.to_user_id, otherUsername: request.other_user?.username ?? undefined }); };
  const confirmAction = async () => {
    if (!confirmDialog) return;
    try { const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED'; await updateStatus({ requestId: confirmDialog.requestId, newStatus, otherUserId: confirmDialog.otherUserId, otherUsername: confirmDialog.otherUsername, myUsername: myProfile?.username ?? undefined }); toast.success(confirmDialog.type === 'reject' ? 'Solicitud rechazada' : 'Solicitud cancelada'); }
    catch { toast.error('Error al actualizar la solicitud'); } finally { setConfirmDialog(null); }
  };

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="relative px-4 safe-page max-w-md mx-auto">
      <div className="page-vignette" />
      <div className="relative z-20 space-y-4">
        <div className="text-center mb-2"><h1 className="text-[22px] font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>Solicitudes</h1></div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--surface-input-border)' }}>
          <button onClick={() => setActiveTab('received')} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
            style={activeTab === 'received' ? { background: `linear-gradient(135deg, var(--btn-gradient-from), var(--btn-gradient-to))`, color: '#FFFFFF' } : { background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
            <Inbox className="h-4 w-4" />Recibidas
          </button>
          <button onClick={() => setActiveTab('sent')} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
            style={activeTab === 'sent' ? { background: `linear-gradient(135deg, var(--btn-gradient-from), var(--btn-gradient-to))`, color: '#FFFFFF' } : { background: 'var(--surface-card)', color: 'var(--text-secondary)' }}>
            <Send className="h-4 w-4" />Enviadas
          </button>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ background: 'var(--surface-skeleton)' }} />)}</div>
        ) : requests.length === 0 ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            {activeTab === 'received' ? <Inbox className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} /> : <Send className="h-12 w-12 mb-3" style={{ color: 'var(--icon-faint)' }} />}
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>{activeTab === 'received' ? 'No hay solicitudes recibidas.' : 'No hay solicitudes enviadas.'}</p>
          </div>
        ) : (
          <div className="space-y-3">{requests.map((request) => <TradeRequestCard key={request.id} request={request} type={activeTab} onClick={() => handleRequestClick(request.id)} onAccept={activeTab === 'received' ? () => handleAccept(request.id, request) : undefined} onReject={activeTab === 'received' ? () => handleReject(request.id, request) : undefined} onCancel={activeTab === 'sent' ? () => handleCancel(request.id, request) : undefined} isUpdating={isUpdating} />)}</div>
        )}
      </div>

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent style={{ background: 'var(--dialog-bg)', border: '1px solid var(--surface-input-border)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>{confirmDialog?.type === 'reject' ? '¿Rechazar solicitud?' : '¿Cancelar solicitud?'}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>{confirmDialog?.type === 'reject' ? '¿Seguro que quieres rechazar esta solicitud de intercambio?' : '¿Seguro que quieres cancelar esta solicitud de intercambio?'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11" style={{ background: 'var(--surface-input)', border: '1px solid var(--surface-input-border)', color: 'var(--text-primary)' }}>No, volver</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className="min-h-11 btn-themed">Sí, {confirmDialog?.type === 'reject' ? 'rechazar' : 'cancelar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Requests;
