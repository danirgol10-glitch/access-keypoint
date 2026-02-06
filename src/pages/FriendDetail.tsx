import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFriendHelpfulStickers } from '@/hooks/useFriendHelpfulStickers';
import { useTradeRequests } from '@/hooks/useTradeRequests';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';

const FriendDetail = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [selectedStickers, setSelectedStickers] = useState<Set<string>>(new Set());
  
  const { createRequest, isCreating } = useTradeRequests();
  const { profile: myProfile } = useUserProfile();

  // Fetch friend's username
  const { data: friendProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['friend-profile', friendId],
    queryFn: async () => {
      if (!friendId) return null;

      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', friendId)
        .single();

      if (error) {
        console.error('Error fetching friend profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!friendId,
  });

  const { helpfulStickers, isLoading: stickersLoading, count } = useFriendHelpfulStickers(friendId);

  const isLoading = profileLoading || stickersLoading;

  const toggleSticker = (stickerId: string) => {
    setSelectedStickers(prev => {
      const next = new Set(prev);
      if (next.has(stickerId)) {
        next.delete(stickerId);
      } else {
        next.add(stickerId);
      }
      return next;
    });
  };

  const handleRequestClick = async () => {
    if (!friendId || selectedStickers.size === 0) return;

    // Validate: cannot request 0 items (already checked above)
    // Re-validate selected stickers are still in helpful list
    const validStickers = Array.from(selectedStickers).filter(id =>
      helpfulStickers.some(s => s.id === id)
    );

    if (validStickers.length === 0) {
      toast({
        title: 'No valid stickers',
        description: 'The selected stickers are no longer available.',
        variant: 'destructive',
      });
      setSelectedStickers(new Set());
      return;
    }

    try {
      await createRequest({
        toUserId: friendId,
        stickerIds: validStickers,
        fromUsername: myProfile?.username ?? undefined,
      });

      toast({
        title: 'Request sent',
        description: `Request sent to @${friendProfile?.username ?? 'friend'}`,
      });

      setSelectedStickers(new Set());
      navigate('/requests');
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const selectedCount = selectedStickers.size;

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
            {profileLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <h1 className="text-lg font-semibold text-foreground">
                @{friendProfile?.username ?? 'Unknown'}
              </h1>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 pb-40">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Summary */}
          <div className="text-center py-2">
            {isLoading ? (
              <Skeleton className="h-5 w-48 mx-auto" />
            ) : (
              <p className="text-muted-foreground">
                Has <span className="font-semibold text-foreground">{count}</span> sticker{count !== 1 ? 's' : ''} you need
              </p>
            )}
          </div>

          {/* Sticker list */}
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
              ))}
            </div>
          ) : count === 0 ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">
                  No duplicates from this friend match your needs yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Ask @{friendProfile?.username ?? 'your friend'} to mark their duplicate stickers in the Album tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {helpfulStickers.map((sticker) => {
                const isSelected = selectedStickers.has(sticker.id);
                return (
                  <button
                    key={sticker.id}
                    onClick={() => toggleSticker(sticker.id)}
                    className={`relative aspect-[3/4] rounded-lg border p-2 flex flex-col items-center justify-center text-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:bg-accent/50'
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className="absolute top-2 right-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSticker(sticker.id)}
                        aria-label={`Select sticker ${sticker.code}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <span className="font-semibold text-foreground text-sm">
                      {sticker.code}
                    </span>
                    {sticker.team && (
                      <span className="text-xs text-muted-foreground mt-1 truncate w-full px-1">
                        {sticker.team}
                      </span>
                    )}
                    {sticker.section && !sticker.team && (
                      <span className="text-xs text-muted-foreground mt-1 truncate w-full px-1">
                        {sticker.section}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Sticky bottom action bar - above tab bar */}
      {count > 0 && (
        <div className="fixed left-0 right-0 bottom-16 z-20 bg-background border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto">
            <Button
              className="w-full"
              disabled={selectedCount === 0 || isCreating}
              onClick={handleRequestClick}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : selectedCount === 0 ? (
                'Select stickers'
              ) : (
                `Request (${selectedCount})`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendDetail;
