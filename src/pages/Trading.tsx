import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useConversations } from '@/hooks/useConversations';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useFriendAlbumStats } from '@/hooks/useFriendAlbumStats';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  useIncomingRequests,
  useOutgoingRequests,
  useSendFriendRequest,
  useRespondToRequest,
} from '@/hooks/useFriendships';
import { TradeRequestCard } from '@/components/TradeRequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import {
  MessageCircle,
  Users,
  UserPlus,
  User,
  Check,
  X,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { toast as uiToast } from '@/hooks/use-toast';

const Trading = () => {
  const navigate = useNavigate();
  const { profile: myProfile } = useUserProfile();
  const { t } = useLanguage();

  const { sentRequests, receivedRequests, isLoading: tradeLoading, updateStatus, isUpdating } = useTradeRequests();
  const { data: conversations = [], isLoading: chatsLoading } = useConversations();

  const { incomingRequests, isLoading: incomingLoading } = useIncomingRequests();
  const { outgoingRequests, isLoading: outgoingLoading } = useOutgoingRequests();
  const { friendStats, isLoading: statsLoading } = useFriendAlbumStats();
  const sendFriendRequest = useSendFriendRequest();
  const respondToFriendRequest = useRespondToRequest();

  const [usernameInput, setUsernameInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'reject' | 'cancel';
    requestId: string;
    otherUserId: string;
    otherUsername?: string;
  } | null>(null);

  const pendingReceived = receivedRequests.filter((r) => r.status === 'SENT');
  const pendingSent = sentRequests.filter((r) => r.status === 'SENT');
  const hasPendingRequests = pendingReceived.length > 0 || pendingSent.length > 0;

  const activeTrades = [
    ...sentRequests.filter((r) => r.status === 'ACCEPTED'),
    ...receivedRequests.filter((r) => r.status === 'ACCEPTED'),
  ];

  const handleAccept = async (requestId: string, request: typeof receivedRequests[0]) => {
    try {
      await updateStatus({
        requestId,
        newStatus: 'ACCEPTED',
        otherUserId: request.from_user_id,
        otherUsername: request.other_user?.username ?? undefined,
        myUsername: myProfile?.username ?? undefined,
      });
      toast.success(t('trade.statusAccepted'));
    } catch {
      toast.error(t('trading.error'));
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
      toast.success(confirmDialog.type === 'reject' ? t('trading.requestRejected') : t('trade.statusCancelled'));
    } catch {
      toast.error(t('trading.error'));
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!usernameInput.trim()) {
      setInputError(t('trading.enterUsername'));
      return;
    }
    setInputError(null);
    const result = await sendFriendRequest.mutateAsync(usernameInput.trim());
    if (result.success) {
      uiToast({ title: t('trading.requestSent'), description: t('trading.requestSentTo', { username: usernameInput }) });
      setUsernameInput('');
    } else {
      setInputError(result.error ?? t('trading.error'));
    }
  };

  const handleRespondFriend = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToFriendRequest.mutateAsync({ friendshipId, accept });
      uiToast({
        title: accept ? t('trading.friendAdded') : t('trading.requestRejected'),
        description: accept ? t('trading.youAreNowFriends') : t('trading.theRequestRejected'),
      });
    } catch {
      uiToast({ title: t('trading.error'), description: t('trading.failedToRespond'), variant: 'destructive' });
    }
  };

  const isLoading = tradeLoading || chatsLoading || incomingLoading || outgoingLoading || statsLoading;

  return (
    <div className="flex flex-col p-4 space-y-4 pb-24">
      <h1 className="text-2xl font-semibold text-foreground">{t('trading.title')}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Pending Trade Requests */}
          {hasPendingRequests && (
            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('trading.pendingRequests')}
              </h2>

              {pendingReceived.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('trading.incoming')}</h3>
                  {pendingReceived.map((request) => (
                    <TradeRequestCard
                      key={request.id}
                      request={request}
                      type="received"
                      onClick={() => navigate(`/request/${request.id}`)}
                      onAccept={() => handleAccept(request.id, request)}
                      onReject={() => handleReject(request.id, request)}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              )}

              {pendingSent.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{t('trading.outgoing')}</h3>
                  {pendingSent.map((request) => (
                    <TradeRequestCard
                      key={request.id}
                      request={request}
                      type="sent"
                      onClick={() => navigate(`/request/${request.id}`)}
                      onCancel={() => handleCancel(request.id, request)}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Active Trades */}
          {activeTrades.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Check className="h-5 w-5" />
                {t('trading.activeTrades')}
              </h2>
              <div className="space-y-2">
                {activeTrades.map((trade) => (
                  <Card
                    key={trade.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/request/${trade.id}`)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <span className="font-medium text-foreground">
                          @{trade.other_user?.username ?? t('common.unknown')}
                        </span>
                        <p className="text-sm text-muted-foreground">{t('trading.chatAvailable')}</p>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {t('trading.open')}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Chats */}
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('trading.chats')}
            </h2>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t('trading.noChats')}
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((convo) => (
                  <Card
                    key={convo.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => navigate(`/chat/${convo.id}`)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            @{convo.other_username ?? t('common.unknown')}
                          </span>
                          {convo.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                              {convo.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {convo.last_message_text ?? t('trading.noMessages')}
                        </p>
                      </div>
                      {convo.last_message_at && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Friends */}
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('trading.friends')}
            </h2>

            <div className="flex gap-2">
              <Input
                placeholder={t('trading.addFriendPlaceholder')}
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setInputError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendFriendRequest()}
                className="flex-1"
              />
              <Button
                onClick={handleSendFriendRequest}
                disabled={sendFriendRequest.isPending}
                size="sm"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            {inputError && (
              <p className="text-sm text-destructive">{inputError}</p>
            )}

            {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
              <div className="space-y-2">
                {incomingRequests.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('trading.incomingFriendRequests')}</h3>
                    {incomingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">@{req.requester?.username ?? t('common.unknown')}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleRespondFriend(req.id, true)} disabled={respondToFriendRequest.isPending}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRespondFriend(req.id, false)} disabled={respondToFriendRequest.isPending}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {outgoingRequests.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('trading.outgoingFriendRequests')}</h3>
                    {outgoingRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">@{req.addressee?.username ?? t('common.unknown')}</span>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {t('trading.pending')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {friendStats.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                {t('trading.noFriends')}
              </p>
            ) : (
              <div className="space-y-2">
                {friendStats.map((friend) => (
                  <button
                    key={friend.friendId}
                    onClick={() => navigate(`/friend-profile/${friend.friendId}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">@{friend.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={friend.progressPercent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {friend.progressPercent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog?.open ?? false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === 'reject' ? t('trading.rejectRequest') : t('trading.cancelRequest')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'reject'
                ? t('trading.confirmReject')
                : t('trading.confirmCancel')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('trading.noGoBack')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {confirmDialog?.type === 'reject' ? t('trading.yesReject') : t('trading.yesCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Trading;
