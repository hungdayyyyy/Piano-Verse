export const STREAMING_URLS = {
  TRACKS: "/streaming/tracks",
  MOST_PLAYED: "/streaming/tracks/most-played",
  SEARCH: "/streaming/tracks/search",
  BY_ARTIST: (artist: string) => `/streaming/tracks/artist/${encodeURIComponent(artist)}`,
  BY_DIFFICULTY: (d: string) => `/streaming/tracks/difficulty/${d}`,
  PLAY: (id: string) => `/streaming/tracks/${id}/play`,
  FAVORITE: (id: string) => `/streaming/tracks/${id}/favorite`,
  FAVORITES: "/streaming/favorites",
  RECENTLY_PLAYED: "/streaming/recently-played",
  UPLOAD_AUDIO: "/streaming/tracks/upload/audio",
  UPLOAD_VIDEO: "/streaming/tracks/upload/video",
  DELETE: (id: string) => `/streaming/tracks/${id}`,
} as const;
