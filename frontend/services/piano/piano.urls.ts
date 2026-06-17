export const PIANO_URLS = {
  SAMPLES: "/piano/samples",
  CONFIG: "/piano/config",
  MIDI_MAPPINGS: "/piano/midi-mappings",
  SHEET_MUSIC: "/piano/sheet-music",
  SHEET_MUSIC_BY_ID: (id: string) => `/piano/sheet-music/${id}`,
  RECORDINGS: "/piano/recordings",
} as const;
