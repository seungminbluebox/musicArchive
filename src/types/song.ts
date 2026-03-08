export interface Track {
  id: string;
  title: string;
  audioSrc: string;
  highlightLyrics?: string; // Optional: If provided, renders the highlighted lyrics section
  isTitle?: string | boolean;
  lyricsBy?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  themeBase: string;
  themeSub: string;
  themeAccent: string;
  themeText: string;
  audioSrc: string; // DEPRECATED: use tracks[0].audioSrc or track.audioSrc
  images: string[];
  highlightLyrics?: string; // Optional: Single song version of highlighted lyrics
  lyricsBy?: string;
  log?: string; // Optional: Curator's note/description section
  createdAt: string;
  tracks?: Track[]; // Optional for backward compatibility, but recommended for album strategy
  releaseDate?: string;
  duration?: string;
}
