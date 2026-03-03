import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Users, Search, UserPlus, User, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFriendAlbumStats } from '@/hooks/useFriendAlbumStats';
import { useSendFriendRequest } from '@/hooks/useFriendships';
import { useSuggestedFriends } from '@/hooks/useSuggestedFriends';
import { useUserSearch } from '@/hooks/useUserSearch';
import { toast } from '@/hooks/use-toast';

const Friends = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const { friendStats, isLoading: statsLoading } = useFriendAlbumStats();
  const sendRequest = useSendFriendRequest();
  const { results: searchResults, isSearching } = useUserSearch(searchQuery);
  const { suggestions, isLoading: suggestionsLoading } = useSuggestedFriends();

  const handleAddFriend = async (username: string) => {
    const result = await sendRequest.mutateAsync(username);
    if (result.success) {
      toast({ title: t('trading.requestSent'), description: t('trading.requestSentTo', { username }) });
    } else {
      toast({ title: t('trading.error'), description: result.error ?? '', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 pb-24">
      <p className="text-xs font-mono text-destructive w-full max-w-md">FRIENDS SCREEN v2 ACTIVE</p>
      <h1 className="text-2xl font-bold text-foreground w-full max-w-md">{t('friends.title')}</h1>

      {/* Search Users */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('friends.searchUsers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder={t('friends.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          {isSearching && (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          )}
          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">
              {t('friends.noResults')}
            </p>
          )}
          {searchResults.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">@{u.username}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[u.city, u.university_name].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddFriend(u.username!)}
                disabled={sendRequest.isPending || u.isFriend || u.isPending}
              >
                {u.isFriend ? t('friends.alreadyFriends') : u.isPending ? t('trading.pending') : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    {t('friends.add')}
                  </>
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* My Friends */}
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t('friends.myFriends')} ({friendStats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : friendStats.length === 0 ? (
            <div className="text-center py-6 space-y-1">
              <p className="text-sm text-muted-foreground">{t('friends.noFriendsYet')}</p>
              <p className="text-xs text-muted-foreground">{t('friends.searchToConnect')}</p>
            </div>
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
        </CardContent>
      </Card>

      {/* Suggested Friends */}
      {suggestions.length > 0 && (
        <Card className="w-full max-w-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t('friends.suggested')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestionsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">@{u.username}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[u.city, u.university_name].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddFriend(u.username!)}
                      disabled={sendRequest.isPending}
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      {t('friends.add')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Friends;
