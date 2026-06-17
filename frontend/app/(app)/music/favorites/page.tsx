"use client";
import { Heart, Music2 } from "lucide-react";
import { useGetFavoritesQuery } from "@/features/streaming/streamingApi";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { data, isLoading } = useGetFavoritesQuery();
  const favs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">Your saved tracks</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-20 rounded-xl"/>)}</div>
      ) : favs.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites yet"
          description="Heart any track while browsing music to save it here."
          action={<Link href="/music"><Button variant="outline">Browse Music</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {favs.map((track) => (
            <div key={track._id} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--background-card)] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <Music2 className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.title}</p>
                <p className="text-sm text-[var(--foreground-muted)]">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
