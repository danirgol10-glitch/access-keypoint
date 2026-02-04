import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TradeRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  other_user?: {
    username: string | null;
  };
  item_count?: number;
}

export interface TradeRequestItem {
  id: string;
  trade_request_id: string;
  sticker_id: string;
  sticker?: {
    code: string;
    team: string | null;
    section: string | null;
  };
}

export function useTradeRequests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sent requests
  const { data: sentRequests = [], isLoading: sentLoading } = useQuery({
    queryKey: ['trade-requests', 'sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: requests, error } = await supabase
        .from('trade_requests')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent requests:', error);
        return [];
      }

      // Get other user info and item counts
      const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
          const [userRes, itemRes] = await Promise.all([
            supabase.from('users').select('username').eq('id', req.to_user_id).single(),
            supabase.from('trade_request_items').select('id').eq('trade_request_id', req.id),
          ]);

          return {
            ...req,
            other_user: userRes.data,
            item_count: itemRes.data?.length ?? 0,
          } as TradeRequest;
        })
      );

      return enrichedRequests;
    },
    enabled: !!user?.id,
  });

  // Fetch received requests
  const { data: receivedRequests = [], isLoading: receivedLoading } = useQuery({
    queryKey: ['trade-requests', 'received', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: requests, error } = await supabase
        .from('trade_requests')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received requests:', error);
        return [];
      }

      // Get other user info and item counts
      const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
          const [userRes, itemRes] = await Promise.all([
            supabase.from('users').select('username').eq('id', req.from_user_id).single(),
            supabase.from('trade_request_items').select('id').eq('trade_request_id', req.id),
          ]);

          return {
            ...req,
            other_user: userRes.data,
            item_count: itemRes.data?.length ?? 0,
          } as TradeRequest;
        })
      );

      return enrichedRequests;
    },
    enabled: !!user?.id,
  });

  // Create trade request mutation
  const createRequestMutation = useMutation({
    mutationFn: async ({
      toUserId,
      stickerIds,
    }: {
      toUserId: string;
      stickerIds: string[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Create the trade request
      const { data: request, error: requestError } = await supabase
        .from('trade_requests')
        .insert({
          from_user_id: user.id,
          to_user_id: toUserId,
          status: 'SENT',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Create the trade request items
      const items = stickerIds.map((stickerId) => ({
        trade_request_id: request.id,
        sticker_id: stickerId,
      }));

      const { error: itemsError } = await supabase
        .from('trade_request_items')
        .insert(items);

      if (itemsError) throw itemsError;

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
    },
  });

  return {
    sentRequests,
    receivedRequests,
    isLoading: sentLoading || receivedLoading,
    createRequest: createRequestMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
  };
}

export function useTradeRequestDetail(requestId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trade-request-detail', requestId],
    queryFn: async () => {
      if (!requestId) return null;

      // Get the request
      const { data: request, error: requestError } = await supabase
        .from('trade_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        console.error('Error fetching request:', requestError);
        return null;
      }

      // Get the other user
      const otherUserId =
        request.from_user_id === user?.id ? request.to_user_id : request.from_user_id;

      const { data: otherUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', otherUserId)
        .single();

      // Get the items with sticker info
      const { data: items, error: itemsError } = await supabase
        .from('trade_request_items')
        .select('id, trade_request_id, sticker_id')
        .eq('trade_request_id', requestId);

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
        return null;
      }

      // Get sticker details
      const stickerIds = items.map((item) => item.sticker_id);
      const { data: stickers } = await supabase
        .from('stickers')
        .select('id, code, team, section')
        .in('id', stickerIds);

      const stickersMap = new Map(stickers?.map((s) => [s.id, s]) ?? []);

      const enrichedItems: TradeRequestItem[] = items.map((item) => ({
        ...item,
        sticker: stickersMap.get(item.sticker_id),
      }));

      return {
        ...request,
        other_user: otherUser,
        items: enrichedItems,
        isFromMe: request.from_user_id === user?.id,
      };
    },
    enabled: !!requestId && !!user?.id,
  });
}
