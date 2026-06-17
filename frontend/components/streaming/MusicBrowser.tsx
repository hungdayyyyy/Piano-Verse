"use client";

import { useState } from "react";
import { Music2, Play, Heart, Search, TrendingUp } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  useGetTracksQuery,
  useGetMostPlayedQuery,
  useSearchTracksQuery,
  useToggleFavoriteMutation,
  useRecordPlayMutation,
} from "@/features/streaming/streamingApi";
import { playTrack } from "@/features/streaming/playerSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ComingSoonCard } from "@/components/shared/coming-soon-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDuration, capitalize } from "@/lib/utils";
import type { Track } from "@/lib/api/types";
import { toast } from "sonner";

function TrackCard({ track }: { track: Track }) {
  const dispatch = useDispatch();
  const [toggleFav] = useToggleFavoriteMutation();
  const [recordPlay] = useRecordPlayMutation();

  const handlePlay = async () => {
    dispatch(playTrack({ track }));
    try {
      await recordPlay(track._id);
    } catch {
      // Non-critical
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFav(track._id);
      toast.success("Favorites updated");
    } catch {
      toast.error("Could not update favorites");
    }
  };

  return (
    <Card className="group cursor-pointer transition-all hover:border-[var(--border-muted)] hover:shadow-md">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 overflow-hidden">
          {track.thumbnailUrl ? (
            <img src={track.thumbnailUrl} alt={track.title} className="h-full w-full object-cover" />
          ) : (
            <Music2 className="h-6 w-6 text-[var(--primary)]" />
          )}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
            aria-label={`Play ${track.title}`}
          >
            <Play className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{track.title}</p>
          <p className="text-sm text-[var(--foreground-muted)] truncate">{track.artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px]">
              {capitalize(track.difficulty)}
            </Badge>
            <span className="text-xs text-[var(--foreground-subtle)]">
              {formatDuration(track.durationSeconds)}
            </span>
            <span className="text-xs text-[var(--foreground-subtle)]">
              {track.playCount.toLocaleString()} plays
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleFavorite}
          className="text-[var(--foreground-muted)] hover:text-[var(--destructive)] transition-colors p-1"
          aria-label="Toggle favorite"
        >
          <Heart className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}

function TrackListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

function TrackList({ tracks, isLoading }: { tracks: Track[]; isLoading: boolean }) {
  if (isLoading) return <TrackListSkeleton />;

  if (tracks.length === 0) {
    return (
      <EmptyState
        icon={Music2}
        title="No tracks available"
        description="The music catalog is empty. Teachers and admins can upload tracks via the upload page."
      />
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <TrackCard key={track._id} track={track} />
      ))}
    </div>
  );
}

export function MusicBrowser() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allData, isLoading: allLoading } = useGetTracksQuery();
  const { data: popularData, isLoading: popularLoading } = useGetMostPlayedQuery();
  const { data: searchData, isLoading: searchLoading } = useSearchTracksQuery(searchQuery, {
    skip: searchQuery.length < 2,
  });

  const allTracks = allData?.data ?? [];
  const popularTracks = popularData?.data ?? [];
  const searchResults = searchData?.data ?? [];

  const isSearching = searchQuery.length >= 2;

  return (
    <div className="space-y-5">
      {/* Note about mocked backend */}
      <Badge variant="mocked" className="text-xs">
        Note: Track catalog endpoints currently return empty arrays — streaming service is mocked. Upload tracks via Music → Upload (teacher/admin) to populate.
      </Badge>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search tracks, artists…"
        className="max-w-md"
      />

      {isSearching ? (
        <div>
          <h3 className="text-sm font-medium mb-3">
            Search results for &quot;{searchQuery}&quot;
            {searchData && <span className="text-[var(--foreground-muted)] ml-2">({searchResults.length})</span>}
          </h3>
          <TrackList tracks={searchResults} isLoading={searchLoading} />
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tracks</TabsTrigger>
            <TabsTrigger value="popular">Most Played</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TrackList tracks={allTracks} isLoading={allLoading} />
          </TabsContent>

          <TabsContent value="popular">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                  Most Played
                </CardTitle>
              </CardHeader>
            </Card>
            <TrackList tracks={popularTracks} isLoading={popularLoading} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
