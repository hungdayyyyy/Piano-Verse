import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api/baseQuery";
import type { ApiResponse, Track, Difficulty } from "@/lib/api/types";

export const streamingApi = createApi({
  reducerPath: "streamingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tracks", "Favorites", "RecentlyPlayed"],
  endpoints: (builder) => ({
    // GET /api/streaming/tracks — currently returns [] from mocked service
    getTracks: builder.query<ApiResponse<Track[]>, void>({
      query: () => "/streaming/tracks",
      providesTags: ["Tracks"],
    }),

    // GET /api/streaming/tracks/most-played
    getMostPlayed: builder.query<ApiResponse<Track[]>, void>({
      query: () => "/streaming/tracks/most-played",
    }),

    // GET /api/streaming/tracks/search?q=
    searchTracks: builder.query<ApiResponse<Track[]>, string>({
      query: (q) => `/streaming/tracks/search?q=${encodeURIComponent(q)}`,
    }),

    // GET /api/streaming/tracks/artist/:artist
    getByArtist: builder.query<ApiResponse<Track[]>, string>({
      query: (artist) =>
        `/streaming/tracks/artist/${encodeURIComponent(artist)}`,
    }),

    // GET /api/streaming/tracks/difficulty/:difficulty
    getByDifficulty: builder.query<ApiResponse<Track[]>, Difficulty>({
      query: (difficulty) => `/streaming/tracks/difficulty/${difficulty}`,
    }),

    // POST /api/streaming/tracks/:trackId/play
    recordPlay: builder.mutation<ApiResponse<null>, string>({
      query: (trackId) => ({
        url: `/streaming/tracks/${trackId}/play`,
        method: "POST",
      }),
    }),

    // GET /api/streaming/recently-played (requires auth)
    getRecentlyPlayed: builder.query<ApiResponse<Track[]>, void>({
      query: () => "/streaming/recently-played",
      providesTags: ["RecentlyPlayed"],
    }),

    // POST /api/streaming/tracks/:trackId/favorite (toggles)
    toggleFavorite: builder.mutation<ApiResponse<null>, string>({
      query: (trackId) => ({
        url: `/streaming/tracks/${trackId}/favorite`,
        method: "POST",
      }),
      invalidatesTags: ["Favorites"],
    }),

    // GET /api/streaming/favorites (requires auth)
    getFavorites: builder.query<ApiResponse<Track[]>, void>({
      query: () => "/streaming/favorites",
      providesTags: ["Favorites"],
    }),

    // POST /api/streaming/tracks/upload/audio (teacher/admin)
    uploadAudio: builder.mutation<ApiResponse<Track>, FormData>({
      queryFn: async (formData, api) => {
        const token = (
          api.getState() as { auth: { accessToken: string | null } }
        ).auth.accessToken;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/streaming/tracks/upload/audio`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }
        );
        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data } };
        return { data };
      },
      invalidatesTags: ["Tracks"],
    }),

    // POST /api/streaming/tracks/upload/video (teacher/admin)
    uploadVideo: builder.mutation<ApiResponse<Track>, FormData>({
      queryFn: async (formData, api) => {
        const token = (
          api.getState() as { auth: { accessToken: string | null } }
        ).auth.accessToken;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/streaming/tracks/upload/video`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }
        );
        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data } };
        return { data };
      },
      invalidatesTags: ["Tracks"],
    }),

    // DELETE /api/streaming/tracks/:id (admin)
    deleteTrack: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/streaming/tracks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tracks"],
    }),
  }),
});

export const {
  useGetTracksQuery,
  useGetMostPlayedQuery,
  useSearchTracksQuery,
  useGetByArtistQuery,
  useGetByDifficultyQuery,
  useRecordPlayMutation,
  useGetRecentlyPlayedQuery,
  useToggleFavoriteMutation,
  useGetFavoritesQuery,
  useUploadAudioMutation,
  useUploadVideoMutation,
  useDeleteTrackMutation,
} = streamingApi;
