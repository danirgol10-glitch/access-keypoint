import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { TradeRequestCard } from '@/components/TradeRequestCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Inbox, Send } from 'lucide-react';
import { toast } from 'sonner';

const Requests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { sentRequests, receivedRequests, isLoading, updateStatus, isUpdating } = useTradeRequests();
  const { profile: myProfile } = useUserProfile();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'reject' | 'cancel';
    requestId: string;
    otherUserId: string;
    otherUsername?: string;
  } | null>(null);

  const handleRequestClick = (requestId: string) => navigate(`/request/${requestId}`);

  const handleAccept = async (requestId: string, request: typeof receivedRequests[0]) => {
    try {
      await updateStatus({ requestId, newStatus: 'ACCEPTED', otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined, myUsername: myProfile?.username ?? undefined });
      toast.success('Request accepted');
    } catch { toast.error('Failed to accept request'); }
  };

  const handleReject = (requestId: string, request: typeof receivedRequests[0]) => {
    setConfirmDialog({ open: true, type: 'reject', requestId, otherUserId: request.from_user_id, otherUsername: request.other_user?.username ?? undefined });
  };

  const handleCancel = (requestId: string, request: typeof sentRequests[0]) => {
    setConfirmDialog({ open: true, type: 'cancel', requestId, otherUserId: request.to_user_id, otherUsername: request.other_user?.username ?? undefined });
  };

  const confirmAction = async () => {
    if (!confirmDialog) return;
    try {
      const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED';
      await updateStatus({ requestId: confirmDialog.requestId, newStatus, otherUserId: confirmDialog.otherUserId, otherUsername: confirmDialog.otherUsername, myUsername: myProfile?.username ?? undefined });
      toast.success(confirmDialog.type === 'reject' ? 'Request rejected' : 'Request cancelled');
    } catch { toast.error('Failed to update request'); } finally { setConfirmDialog(null); }
  };

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="relative px-4 pt-14 pb-28 max-w-md mx-auto">
      <div className="page-vignette" />

      <div className="relative z-20 space-y-4">
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-bold tracking-wide" style={{ color: '#FFFFFF' }}>Requests</h1>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
          <button
            onClick={() => setActiveTab('received')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
            style={activeTab === 'received' ? { background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}
          >
            <Inbox className="h-4 w-4" />
            Received
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors"
            style={activeTab === 'sent' ? { background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', color: '#FFFFFF' } : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)' }}
          >
            <Send className="h-4 w-4" />
            Sent
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }} />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="premium-panel p-8 flex flex-col items-center text-center">
            {activeTab === 'received' ? <Inbox className="h-12 w-12 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} /> : <Send className="h-12 w-12 mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />}
            <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              No requests {activeTab === 'received' ? 'received' : 'sent'} yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <TradeRequestCard
                key={request.id}
                request={request}
                type={activeTab}
                onClick={() => handleRequestClick(request.id)}
                onAccept={activeTab === 'received' ? () => handleAccept(request.id, request) : undefined}
                onReject={activeTab === 'received' ? () => handleReject(request.id, request) : undefined}
                onCancel={activeTab === 'sent' ? () => handleCancel(request.id, request) : undefined}
                isUpdating={isUpdating}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent style={{ background: '#0A1A3A', border: '1px solid rgba(255,255,255,0.10)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#FFFFFF' }}>{confirmDialog?.type === 'reject' ? 'Reject Request?' : 'Cancel Request?'}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'rgba(255,255,255,0.6)' }}>{confirmDialog?.type === 'reject' ? 'Are you sure you want to reject this trade request?' : 'Are you sure you want to cancel this trade request?'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.85)' }}>No, go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} style={{ background: 'linear-gradient(135deg, #0A2B73, #1E5AA6)', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF' }}>Yes, {confirmDialog?.type === 'reject' ? 'reject' : 'cancel'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Requests;
