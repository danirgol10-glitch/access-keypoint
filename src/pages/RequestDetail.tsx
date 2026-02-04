import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTradeRequestDetail, useTradeRequests } from '@/hooks/useTradeRequests';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { ArrowLeft, Package, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  SENT: { label: 'Pending', variant: 'default' },
  ACCEPTED: { label: 'Accepted', variant: 'secondary' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'outline' },
};

const RequestDetail = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: request, isLoading } = useTradeRequestDetail(requestId);
  const { updateStatus, isUpdating } = useTradeRequests();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'reject' | 'cancel';
  } | null>(null);

  const statusInfo = request ? statusConfig[request.status] : null;
  const canAct = request?.status === 'SENT';
  const isReceiver = request && request.to_user_id === user?.id;
  const isSender = request && request.from_user_id === user?.id;

  const handleAccept = async () => {
    if (!requestId) return;
    try {
      await updateStatus({ requestId, newStatus: 'ACCEPTED' });
      toast.success('Request accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleReject = () => {
    setConfirmDialog({ open: true, type: 'reject' });
  };

  const handleCancel = () => {
    setConfirmDialog({ open: true, type: 'cancel' });
  };

  const confirmAction = async () => {
    if (!confirmDialog || !requestId) return;

    try {
      const newStatus = confirmDialog.type === 'reject' ? 'REJECTED' : 'CANCELLED';
      await updateStatus({ requestId, newStatus });
      toast.success(confirmDialog.type === 'reject' ? 'Request rejected' : 'Request cancelled');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setConfirmDialog(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">Request Details</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </>
          ) : !request ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Request not found.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Request info */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {statusInfo && (
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {request.isFromMe ? 'To' : 'From'}
                    </span>
                    <span className="font-medium">
                      @{request.other_user?.username ?? 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Action buttons */}
              {canAct && (
                <Card>
                  <CardContent className="p-4">
                    {isReceiver && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1"
                          onClick={handleAccept}
                          disabled={isUpdating}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleReject}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {isSender && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleCancel}
                        disabled={isUpdating}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Requested stickers */}
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Requested Stickers ({request.items?.length ?? 0})
                </h2>
                {request.items && request.items.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {request.items.map((item) => (
                      <div
                        key={item.id}
                        className="aspect-[3/4] rounded-lg border border-border bg-card p-2 flex flex-col items-center justify-center text-center"
                      >
                        <span className="font-semibold text-foreground text-sm">
                          {item.sticker?.code ?? 'Unknown'}
                        </span>
                        {item.sticker?.team && (
                          <span className="text-xs text-muted-foreground mt-1 truncate w-full px-1">
                            {item.sticker.team}
                          </span>
                        )}
                        {item.sticker?.section && !item.sticker?.team && (
                          <span className="text-xs text-muted-foreground mt-1 truncate w-full px-1">
                            {item.sticker.section}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center py-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No stickers in this request.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </main>

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

export default RequestDetail;
