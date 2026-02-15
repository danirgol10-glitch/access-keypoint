import { useNavigate } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Chats = () => {
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useConversations();

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-semibold text-foreground">Chats</h1>
      </div>

      <div className="flex-1 p-4 pt-2 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-2">No chats yet</p>
              <p className="text-sm text-muted-foreground">
                Chats unlock when a trade request is accepted.
              </p>
            </CardContent>
          </Card>
        ) : (
          conversations.map((convo) => (
            <Card
              key={convo.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/chat/${convo.id}`)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      @{convo.other_username ?? 'Unknown'}
                    </span>
                    {convo.unread_count > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {convo.last_message_text ?? 'No messages yet'}
                  </p>
                </div>
                {convo.last_message_at && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Chats;
