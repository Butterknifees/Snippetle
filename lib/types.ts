export type SongCategory = 'HINDI' | 'ENGLISH';
export type HindiGenre = 'POP' | 'RETRO' | 'RAP';

export type PopularityTier = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Song {
  id: string;
  title: string;
  artist: string;
  movieOrAlbum?: string;
  year?: number;
  audioUrl: string;
  coverUrl?: string;
  popularity?: number; // 0 to 100
  tier?: PopularityTier;
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

// Accurate Quartile Badge Calculation
export function getQuartileBadge(popularity: number = 75): { tier: PopularityTier; label: string; color: string } {
  if (popularity >= 80) {
    return { tier: 'Q1', label: '🔥 Quartile 1 (Top 25% Hit)', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
  } else if (popularity >= 65) {
    return { tier: 'Q2', label: '✨ Quartile 2 (Top 50% Chart)', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
  } else if (popularity >= 45) {
    return { tier: 'Q3', label: '🎵 Quartile 3 (Top 75% Track)', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
  } else {
    return { tier: 'Q4', label: '🎧 Quartile 4 (Indie / Deep Cut)', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
  }
}
