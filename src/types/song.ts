export interface Track {
  id: string;
  title: string;
  audioSrc: string;
  highlightLyrics: string;
  isTitle?: string | boolean;
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
  highlightLyrics: string; // DEPRECATED: use tracks[0].highlightLyrics
  log: string;
  createdAt: string;
  tracks?: Track[]; // Optional for backward compatibility, but recommended for album strategy
}
