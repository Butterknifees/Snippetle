export type SongCategory = 'HINDI' | 'ENGLISH';
export type HindiGenre = 'POP' | 'RETRO' | 'RAP';

export interface Song {
  id: string;
  title: string;
  artist: string;
  movieOrAlbum?: string;
  year?: number;
  audioUrl: string;
  coverUrl?: string;
  category: SongCategory;
  genre?: string;
  spotifyUri?: string;
  spotifyId?: string;
}

export type AttemptStatus = 'NONE' | 'SKIPPED' | 'INCORRECT' | 'ARTIST_CORRECT' | 'CORRECT';

export interface GuessAttempt {
  guess?: string;
  status: AttemptStatus;
  song?: Song;
}

export const GUESS_DURATIONS = [0.1, 0.5, 2.0, 4.0, 8.0, 16.0]; // seconds

export interface SpotifyUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  connectedAt: number;
  topTracks: Song[];
}

export interface GroupRoom {
  code: string;
  hostId: string;
  users: SpotifyUser[];
  playlist: Song[];
  activeSongIndex: number;
}

// Calculate current date YYYY-MM-DD specifically in IST (UTC+5:30)
export function getISTDateString(): string {
  const now = new Date();
  // IST offset is +5.5 hours (+330 mins)
  const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istDate = new Date(utcMs + (5.5 * 60 * 60 * 1000));
  
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
