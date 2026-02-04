import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { TradeRequestCard } from '@/components/TradeRequestCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, Send } from 'lucide-react';

const Requests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { sentRequests, receivedRequests, isLoading } = useTradeRequests();

  const handleRequestClick = (requestId: string) => {
    navigate(`/request/${requestId}`);
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
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
