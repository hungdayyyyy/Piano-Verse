import http, { type ApiResponse } from "@/services/http";
import { STREAMING_URLS } from "./streaming.urls";
import type { Track, Difficulty } from "@/lib/api/types";

const streamingService = {
  getTracks(): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(STREAMING_URLS.TRACKS);
  },

  getMostPlayed(): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(STREAMING_URLS.MOST_PLAYED);
  },

  searchTracks(q: string): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(`${STREAMING_URLS.SEARCH}?q=${encodeURIComponent(q)}`);
  },

  getByArtist(artist: string): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(STREAMING_URLS.BY_ARTIST(artist));
  },

  getByDifficulty(difficulty: Difficulty): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(STREAMING_URLS.BY_DIFFICULTY(difficulty));
  },

  recordPlay(trackId: string): Promise<ApiResponse<null>> {
    return http.post<null>(STREAMING_URLS.PLAY(trackId), undefined, { silent: true });
  },

  toggleFavorite(trackId: string): Promise<ApiResponse<null>> {
    return http.post<null>(STREAMING_URLS.FAVORITE(trackId));
  },

  getFavorites(): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(STREAMING_URLS.FAVORITES);
  },

  getRecentlyPlayed(): Promise<ApiResponse<Track[]>> {
    return http.get<Track[]>(STREAMING_URLS.RECENTLY_PLAYED);
  },

  uploadAudio(formData: FormData): Promise<ApiResponse<Track>> {
    return http.upload<Track>(STREAMING_URLS.UPLOAD_AUDIO, formData);
  },

  uploadVideo(formData: FormData): Promise<ApiResponse<Track>> {
    return http.upload<Track>(STREAMING_URLS.UPLOAD_VIDEO, formData);
  },

  deleteTrack(trackId: string): Promise<ApiResponse<null>> {
    return http.delete<null>(STREAMING_URLS.DELETE(trackId));
  },
};

export default streamingService;
