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

// Helper to create notification
async function createNotification(params: {
  userId: string;
  type: 'TRADE_RECEIVED' | 'TRADE_ACCEPTED' | 'TRADE_REJECTED' | 'TRADE_CANCELLED';
  tradeRequestId: string;
  message: string;
}) {
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    trade_request_id: params.tradeRequestId,
    message: params.message,
  });
  if (error) console.error('Failed to create notification:', error);
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
      fromUsername,
    }: {
      toUserId: string;
      stickerIds: string[];
      fromUsername?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Validate: cannot send to yourself
      if (toUserId === user.id) {
        throw new Error('Cannot send a trade request to yourself');
      }

      // Validate: must have at least one sticker
      if (stickerIds.length === 0) {
        throw new Error('Must select at least one sticker');
      }

      // Validate: must be an accepted friend
      const { data: friendship, error: friendshipError } = await supabase
        .from('friendships')
        .select('status')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${toUserId}),and(requester_id.eq.${toUserId},addressee_id.eq.${user.id})`)
        .eq('status', 'ACCEPTED')
        .maybeSingle();

      if (friendshipError) throw friendshipError;
      if (!friendship) {
        throw new Error('You can only send trade requests to accepted friends');
      }

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

      // Create notification for receiver (TRADE_RECEIVED)
      await createNotification({
        userId: toUserId,
        type: 'TRADE_RECEIVED',
        tradeRequestId: request.id,
        message: `@${fromUsername ?? 'Someone'} requested ${stickerIds.length} sticker${stickerIds.length !== 1 ? 's' : ''}`,
      });

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Update trade request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
      otherUserId,
      otherUsername,
      myUsername,
    }: {
      requestId: string;
      newStatus: 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
      otherUserId: string;
      otherUsername?: string;
      myUsername?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trade_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Create notification based on status change
      const notificationMap = {
        ACCEPTED: {
          type: 'TRADE_ACCEPTED' as const,
          message: `@${myUsername ?? 'Someone'} accepted your request`,
        },
        REJECTED: {
          type: 'TRADE_REJECTED' as const,
          message: `@${myUsername ?? 'Someone'} rejected your request`,
        },
        CANCELLED: {
          type: 'TRADE_CANCELLED' as const,
          message: `@${myUsername ?? 'Someone'} cancelled the request`,
        },
      };

      const notif = notificationMap[newStatus];
      await createNotification({
        userId: otherUserId,
        type: notif.type,
        tradeRequestId: requestId,
        message: notif.message,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      queryClient.invalidateQueries({ queryKey: ['trade-request-detail'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    sentRequests,
    receivedRequests,
    isLoading: sentLoading || receivedLoading,
    createRequest: createRequestMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
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
