import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, Check, X, Clock, User, ChevronRight } from 'lucide-react';
import {
  useIncomingRequests,
  useOutgoingRequests,
  useSendFriendRequest,
  useRespondToRequest,
} from '@/hooks/useFriendships';
import { useFriendAlbumStats } from '@/hooks/useFriendAlbumStats';
import { toast } from '@/hooks/use-toast';

const Friends = () => {
  const navigate = useNavigate();
  const [usernameInput, setUsernameInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const { incomingRequests, isLoading: incomingLoading } = useIncomingRequests();
  const { outgoingRequests, isLoading: outgoingLoading } = useOutgoingRequests();
  const { friendStats, isLoading: statsLoading } = useFriendAlbumStats();

  const sendRequest = useSendFriendRequest();
  const respondToRequest = useRespondToRequest();

  const handleSendRequest = async () => {
    if (!usernameInput.trim()) {
      setInputError('Please enter a username');
      return;
    }

    setInputError(null);
    const result = await sendRequest.mutateAsync(usernameInput.trim());

    if (result.success) {
      toast({ title: 'Request sent', description: `Friend request sent to @${usernameInput}` });
      setUsernameInput('');
    } else {
      setInputError(result.error ?? 'Failed to send request');
    }
  };

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest.mutateAsync({ friendshipId, accept });
      toast({
        title: accept ? 'Friend added' : 'Request rejected',
        description: accept ? 'You are now friends!' : 'The request has been rejected.',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to respond to request', variant: 'destructive' });
    }
  };

  const isLoading = incomingLoading || outgoingLoading || statsLoading;

  return (
    <div className="flex flex-col items-center p-6 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground w-full max-w-md">Friends</h1>

      {/* Add friend input */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Friend
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter username"
              value={usernameInput}
              onChange={(e) => {
                setUsernameInput(e.target.value);
                setInputError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
              className="flex-1"
            />
            <Button
              onClick={handleSendRequest}
              disabled={sendRequest.isPending}
              size="sm"
            >
              Send
            </Button>
          </div>
          {inputError && (
            <p className="text-sm text-destructive">{inputError}</p>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Friend Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Incoming requests */}
            {incomingRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Incoming
                </h4>
                <div className="space-y-2">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          @{request.requester?.username ?? 'unknown'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleRespond(request.id, true)}
                          disabled={respondToRequest.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRespond(request.id, false)}
                          disabled={respondToRequest.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing requests */}
            {outgoingRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Outgoing
                </h4>
                <div className="space-y-2">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          @{request.addressee?.username ?? 'unknown'}
                        </span>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Friends list */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            My Friends ({friendStats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : friendStats.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No friends yet. Add someone by username above!
            </p>
          ) : (
            <div className="space-y-2">
              {friendStats.map((friend) => {
                const isDev = import.meta.env.DEV;
                return (
                  <button
                    key={friend.friendId}
                    onClick={() => navigate(`/friend-profile/${friend.friendId}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">
                          @{friend.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={friend.progressPercent} 
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {friend.progressPercent.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Owned {friend.ownedCount} • Duplicates {friend.duplicateCount} • Missing {friend.missingCount}
                      </p>
                      {isDev && (
                        <p className="text-[10px] text-muted-foreground/50 font-mono">
                          debug: friend_user_id={friend.friendId} owned={friend.ownedCount} dup={friend.duplicateCount}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Friends;
