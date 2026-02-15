import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockedUsers } from './useBlockedUsers';

export interface Conversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  last_message_at: string | null;
  other_username: string | null;
  other_user_id: string;
  last_message_text: string | null;
  unread_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const { blockedIds } = useBlockedUsers();

  return useQuery({
    queryKey: ['conversations', user?.id, blockedIds],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return [];

      const { data: convos, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      // Enrich each conversation, filter out blocked users
      const blockedSet = new Set(blockedIds);
      const enriched = await Promise.all(
        convos
          .filter((c) => {
            const otherUserId = c.user_a_id === user.id ? c.user_b_id : c.user_a_id;
            return !blockedSet.has(otherUserId);
          })
          .map(async (c) => {
          const otherUserId = c.user_a_id === user.id ? c.user_b_id : c.user_a_id;

          const [userRes, lastMsgRes, unreadRes] = await Promise.all([
            supabase.from('users').select('username').eq('id', otherUserId).single(),
            supabase
              .from('messages')
              .select('text')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('messages')
              .select('id', { count: 'exact', head: true })
              .eq('conversation_id', c.id)
              .neq('sender_id', user.id)
              .is('read_at', null),
          ]);

          return {
            ...c,
            other_username: userRes.data?.username ?? null,
            other_user_id: otherUserId,
            last_message_text: lastMsgRes.data?.text ?? null,
            unread_count: unreadRes.count ?? 0,
          } as Conversation;
        })
      );

      return enriched;
    },
    enabled: !!user?.id,
  });
}
