import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlbumStats } from '@/hooks/useAlbumStats';
import { Check, Copy, Search } from 'lucide-react';

interface AlbumStatsCardProps {
  stats: AlbumStats;
  compact?: boolean;
}

export function AlbumStatsCard({ stats, compact = false }: AlbumStatsCardProps) {
  const { ownedCount, haveCount, duplicateCount, missingCount, completionPercent, totalStickers } = stats;

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Album Progress</span>
            <span className="text-lg font-bold text-foreground">
              {completionPercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={completionPercent} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{ownedCount} owned</span>
            <span>{missingCount} missing</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Album Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big completion percentage */}
        <div className="text-center">
          <div className="text-5xl font-bold text-primary">
            {completionPercent.toFixed(1)}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {ownedCount} of {totalStickers} stickers
          </p>
        </div>

        <Progress value={completionPercent} className="h-3" />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
            <Check className="w-5 h-5 text-green-600 mb-1" />
            <span className="text-2xl font-bold text-foreground">{ownedCount}</span>
            <span className="text-xs text-muted-foreground">Owned</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
            <Copy className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-2xl font-bold text-foreground">{duplicateCount}</span>
            <span className="text-xs text-muted-foreground">Duplicates</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-secondary/50">
            <Search className="w-5 h-5 text-orange-600 mb-1" />
            <span className="text-2xl font-bold text-foreground">{missingCount}</span>
            <span className="text-xs text-muted-foreground">Missing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
