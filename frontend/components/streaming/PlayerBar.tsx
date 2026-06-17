"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Howl } from "howler";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  X, Music2, Heart, ListMusic,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  togglePlay, nextTrack, prevTrack, setVolume, toggleMute,
  setProgress, setDuration, closePlayer,
  selectCurrentTrack, selectIsPlaying, selectVolume,
  selectProgress, selectPlayerVisible, selectQueue, selectQueueIndex,
} from "@/features/streaming/playerSlice";
import { useRecordPlayMutation, useToggleFavoriteMutation } from "@/features/streaming/streamingApi";
import { Slider } from "@/components/ui/slider";
import { formatDuration, cn } from "@/lib/utils";

export function PlayerBar() {
  const dispatch = useAppDispatch();
  const track = useAppSelector(selectCurrentTrack);
  const isPlaying = useAppSelector(selectIsPlaying);
  const volume = useAppSelector(selectVolume);
  const progress = useAppSelector(selectProgress);
  const duration = useAppSelector(selectDuration);
  const isVisible = useAppSelector(selectPlayerVisible);
  const queue = useAppSelector(selectQueue);
  const queueIndex = useAppSelector(selectQueueIndex);

  const howlRef = useRef<Howl | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showQueue, setShowQueue] = useState(false);

  const [recordPlay] = useRecordPlayMutation();
  const [toggleFav] = useToggleFavoriteMutation();

  // ─── Cleanup helper ───────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (howlRef.current) { howlRef.current.stop(); howlRef.current.unload(); howlRef.current = null; }
  }, []);

  // ─── Load + play when track changes ──────────────────────────────────
  useEffect(() => {
    if (!track?.audioUrl) return;
    cleanup();

    const howl = new Howl({
      src: [track.streamingUrl ?? track.audioUrl],
      html5: true,
      volume,
      onload: () => dispatch(setDuration(howl.duration())),
      onplay: () => {
        progressIntervalRef.current = setInterval(() => {
          dispatch(setProgress((howl.seek() as number / howl.duration()) * 100));
        }, 500);
      },
      onpause: () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); },
      onend: () => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        dispatch(nextTrack());
      },
    });

    howlRef.current = howl;
    if (isPlaying) howl.play();
    if (track._id) recordPlay(track._id).catch(() => {});

    return cleanup;
  }, [track?._id]);

  // ─── Sync play/pause ──────────────────────────────────────────────────
  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (isPlaying) { if (!howl.playing()) howl.play(); }
    else howl.pause();
  }, [isPlaying]);

  // ─── Sync volume ──────────────────────────────────────────────────────
  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume]);

  const handleSeek = (pct: number) => {
    const howl = howlRef.current;
    if (!howl) return;
    howl.seek((pct / 100) * howl.duration());
    dispatch(setProgress(pct));
  };

  if (!isVisible || !track) return null;

  const currentSeconds = (progress / 100) * (duration ?? 0);

  return (
    <>
      {/* Queue drawer */}
      {showQueue && (
        <div className="fixed bottom-20 right-4 z-40 w-72 rounded-xl border border-[var(--border)] bg-[var(--background-card)] shadow-xl animate-slide-in-right">
          <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
            <p className="text-sm font-semibold">Queue ({queue.length})</p>
            <button onClick={() => setShowQueue(false)} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {queue.map((t, i) => (
              <div key={t._id}
                className={cn("flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  i === queueIndex ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "hover:bg-[var(--background-muted)] text-[var(--foreground)]"
                )}>
                {i === queueIndex && <Play className="h-3 w-3 flex-shrink-0 fill-current" />}
                <span className="truncate">{t.title}</span>
                <span className="ml-auto text-xs text-[var(--foreground-muted)] flex-shrink-0">{formatDuration(t.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-[var(--border)] bg-[var(--background-secondary)]/95 backdrop-blur-md">
        {/* Progress bar */}
        <div className="h-1 w-full bg-[var(--background-muted)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0 w-56 flex-shrink-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 overflow-hidden">
              {track.thumbnailUrl
                ? <img src={track.thumbnailUrl} alt={track.title} className="h-full w-full object-cover" />
                : <Music2 className="h-5 w-5 text-[var(--primary)]" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-xs text-[var(--foreground-muted)] truncate">{track.artist}</p>
            </div>
            <button onClick={() => toggleFav(track._id)} className="flex-shrink-0 text-[var(--foreground-muted)] hover:text-[var(--destructive)] transition-colors">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-1 flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <button onClick={() => dispatch(prevTrack())} disabled={queueIndex === 0}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors">
                <SkipBack className="h-5 w-5" />
              </button>
              <button onClick={() => dispatch(togglePlay())}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors shadow-md">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
              </button>
              <button onClick={() => dispatch(nextTrack())} disabled={queueIndex === queue.length - 1}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            {/* Seek bar */}
            <div className="flex w-full max-w-md items-center gap-2">
              <span className="w-9 text-right text-xs text-[var(--foreground-muted)] tabular-nums">{formatDuration(Math.round(currentSeconds))}</span>
              <Slider value={progress} onChange={handleSeek} min={0} max={100} className="flex-1" label="Seek" />
              <span className="w-9 text-xs text-[var(--foreground-muted)] tabular-nums">{formatDuration(duration ?? 0)}</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 w-48 justify-end flex-shrink-0">
            <button onClick={() => setShowQueue((v) => !v)}
              className={cn("transition-colors", showQueue ? "text-[var(--primary)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]")}>
              <ListMusic className="h-4 w-4" />
            </button>
            <button onClick={() => dispatch(toggleMute())} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <Slider value={Math.round(volume * 100)} onChange={(v) => dispatch(setVolume(v / 100))} min={0} max={100} className="w-20" label="Volume" />
            <button onClick={() => dispatch(closePlayer())} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function selectDuration(s: { player: { duration: number } }) { return s.player.duration; }
