import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { TradeRequestCard } from '@/components/TradeRequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const handleRequestClick = (requestId: string) => {
    navigate(`/request/${requestId}`);
  };

  const handleAccept = async (requestId: string, request: typeof receivedRequests[0]) => {
    try {
      await updateStatus({
        requestId,
        newStatus: 'ACCEPTED',
        otherUserId: request.from_user_id,
        otherUsername: request.other_user?.username ?? undefined,
        myUsername: myProfile?.username ?? undefined,
      });
      toast.success('Request accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleReject = (requestId: string, request: typeof receivedRequests[0]) => {
    setConfirmDialog({
      open: true,
      type: 'reject',
      requestId,
      otherUserId: request.from_user_id,
      otherUsername: request.other_user?.username ?? undefined,
    });
  };

  const handleCancel = (requestId: string, request: typeof sentRequests[0]) => {
    setConfirmDialog({
      open: true,
      type: 'cancel',
      requestId,
      otherUserId: request.to_user_id,
      otherUsername: request.other_user?.username ?? undefined,
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog) return;

    try {
      const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED';
      await updateStatus({
        requestId: confirmDialog.requestId,
        newStatus,
        otherUserId: confirmDialog.otherUserId,
        otherUsername: confirmDialog.otherUsername,
        myUsername: myProfile?.username ?? undefined,
      });
      toast.success(confirmDialog.type === 'reject' ? 'Request rejected' : 'Request cancelled');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setConfirmDialog(null);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-semibold text-foreground">Requests</h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'received' | 'sent')}
        className="flex-1 flex flex-col"
      >
        <div className="px-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="received" className="gap-2">
              <Inbox className="h-4 w-4" />
              Received
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="received" className="flex-1 p-4 pt-2 m-0">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : receivedRequests.length === 0 ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No requests received yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((request) => (
                <TradeRequestCard
                  key={request.id}
                  request={request}
                  type="received"
                  onClick={() => handleRequestClick(request.id)}
                  onAccept={() => handleAccept(request.id, request)}
                  onReject={() => handleReject(request.id, request)}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="flex-1 p-4 pt-2 m-0">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : sentRequests.length === 0 ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Send className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No requests sent yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <TradeRequestCard
                  key={request.id}
                  request={request}
                  type="sent"
                  onClick={() => handleRequestClick(request.id)}
                  onCancel={() => handleCancel(request.id, request)}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === 'reject' ? 'Reject Request?' : 'Cancel Request?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'reject'
                ? 'Are you sure you want to reject this trade request? This action cannot be undone.'
                : 'Are you sure you want to cancel this trade request? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, go back</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Yes, {confirmDialog?.type === 'reject' ? 'reject' : 'cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Requests;
