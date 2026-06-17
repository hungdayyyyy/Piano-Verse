"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Track } from "@/lib/api/types";

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  progress: number; // 0–100
  duration: number; // seconds
  isVisible: boolean;
}

const initialState: PlayerState = {
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  progress: 0,
  duration: 0,
  isVisible: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playTrack(state, action: PayloadAction<{ track: Track; queue?: Track[] }>) {
      state.currentTrack = action.payload.track;
      if (action.payload.queue) {
        state.queue = action.payload.queue;
        state.queueIndex = action.payload.queue.findIndex(
          (t) => t._id === action.payload.track._id
        );
      } else {
        state.queue = [action.payload.track];
        state.queueIndex = 0;
      }
      state.isPlaying = true;
      state.isVisible = true;
      state.progress = 0;
    },
    togglePlay(state) {
      state.isPlaying = !state.isPlaying;
    },
    pause(state) {
      state.isPlaying = false;
    },
    resume(state) {
      state.isPlaying = true;
    },
    nextTrack(state) {
      if (state.queueIndex < state.queue.length - 1) {
        state.queueIndex += 1;
        state.currentTrack = state.queue[state.queueIndex];
        state.progress = 0;
        state.isPlaying = true;
      }
    },
    prevTrack(state) {
      if (state.queueIndex > 0) {
        state.queueIndex -= 1;
        state.currentTrack = state.queue[state.queueIndex];
        state.progress = 0;
        state.isPlaying = true;
      }
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.max(0, Math.min(1, action.payload));
      state.isMuted = action.payload === 0;
    },
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    closePlayer(state) {
      state.isVisible = false;
      state.isPlaying = false;
      state.currentTrack = null;
    },
  },
});

export const {
  playTrack,
  togglePlay,
  pause,
  resume,
  nextTrack,
  prevTrack,
  setVolume,
  toggleMute,
  setProgress,
  setDuration,
  closePlayer,
} = playerSlice.actions;

export default playerSlice.reducer;

// Selectors
export const selectCurrentTrack = (s: { player: PlayerState }) =>
  s.player.currentTrack;
export const selectIsPlaying = (s: { player: PlayerState }) =>
  s.player.isPlaying;
export const selectVolume = (s: { player: PlayerState }) => s.player.volume;
export const selectProgress = (s: { player: PlayerState }) => s.player.progress;
export const selectPlayerVisible = (s: { player: PlayerState }) =>
  s.player.isVisible;
export const selectQueue = (s: { player: PlayerState }) => s.player.queue;
export const selectQueueIndex = (s: { player: PlayerState }) =>
  s.player.queueIndex;
