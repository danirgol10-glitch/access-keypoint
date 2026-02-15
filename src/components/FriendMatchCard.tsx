import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface FriendMatchCardProps {
  username: string | null;
  matchCount: number;
  duplicateTotal?: number;
  lastActiveAt?: string | null;
  onView: () => void;
}

export function FriendMatchCard({ username, matchCount, duplicateTotal, lastActiveAt, onView }: FriendMatchCardProps) {
  const activeLabel = lastActiveAt
    ? `Active ${formatDistanceToNow(new Date(lastActiveAt), { addSuffix: true })}`
    : null;

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">@{username ?? 'unknown'}</p>
            <p className="text-sm text-muted-foreground">
              {matchCount > 0
                ? `Has ${matchCount} sticker${matchCount !== 1 ? 's' : ''} you need`
                : 'No matching stickers'
              }
              {duplicateTotal !== undefined && duplicateTotal > 0 && (
                <span className="text-muted-foreground/60"> · {duplicateTotal} dupes</span>
              )}
            </p>
            {activeLabel && (
              <p className="text-xs text-muted-foreground/70">{activeLabel}</p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
      </CardContent>
    </Card>
  );
}
