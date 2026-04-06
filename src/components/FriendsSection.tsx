import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Check, X, Clock, User } from 'lucide-react';
import {
  useIncomingRequests,
  useOutgoingRequests,
  useAcceptedFriends,
  useSendFriendRequest,
  useRespondToRequest,
} from '@/hooks/useFriendships';
import { toast } from '@/hooks/use-toast';

export const FriendsSection = () => {
  const [usernameInput, setUsernameInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const { incomingRequests, isLoading: incomingLoading } = useIncomingRequests();
  const { outgoingRequests, isLoading: outgoingLoading } = useOutgoingRequests();
  const { friends, isLoading: friendsLoading } = useAcceptedFriends();

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
      toast({ title: 'Solicitud enviada', description: `Solicitud de amistad enviada a @${usernameInput}` });
      setUsernameInput('');
    } else {
      setInputError(result.error ?? 'Error al enviar solicitud');
    }
  };

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    try {
      await respondToRequest.mutateAsync({ friendshipId, accept });
      toast({
        title: accept ? 'Amigo agregado' : 'Solicitud rechazada',
        description: accept ? '¡Ahora son amigos!' : 'La solicitud ha sido rechazada.',
      });
    } catch {
      toast({ title: 'Error', description: 'Error al responder', variant: 'destructive' });
    }
  };

  const isLoading = incomingLoading || outgoingLoading || friendsLoading;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add friend input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add friend by username"
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
              <UserPlus className="w-4 h-4 mr-1" />
              Send
            </Button>
          </div>
          {inputError && (
            <p className="text-sm text-destructive">{inputError}</p>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* Incoming requests */}
            {incomingRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Incoming Requests
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
                  Pending Requests
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

            {/* Friends list */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                My Friends ({friends.length})
              </h4>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No friends yet. Add someone by username!
                </p>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.friendshipId}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        @{friend.username ?? 'unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
