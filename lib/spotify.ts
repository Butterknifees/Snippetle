import { Song, SpotifyUser, SongCategory } from './types';
import { HINDI_SONGS_DATABASE } from './hindiSongs';

export const MOCK_SPOTIFY_USERS: SpotifyUser[] = [
  {
    id: "user_aarav",
    displayName: "Aarav Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop",
    connectedAt: Date.now() - 3600000,
    topTracks: [
      HINDI_SONGS_DATABASE[0], // Kesariya
      HINDI_SONGS_DATABASE[1], // Tum Hi Ho
      HINDI_SONGS_DATABASE[4], // Tere Vaaste
      HINDI_SONGS_DATABASE[7], // Apna Bana Le
    ]
  },
  {
    id: "user_ananya",
    displayName: "Ananya Iyer",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
    connectedAt: Date.now() - 1800000,
    topTracks: [
      HINDI_SONGS_DATABASE[2], // Kal Ho Naa Ho
      HINDI_SONGS_DATABASE[8], // Kun Faya Kun
      HINDI_SONGS_DATABASE[12], // Agar Tum Saath Ho
      HINDI_SONGS_DATABASE[3], // Channa Mereya
    ]
  },
  {
    id: "user_rohan",
    displayName: "Rohan Kapoor",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    connectedAt: Date.now() - 900000,
    topTracks: [
      HINDI_SONGS_DATABASE[15], // Choo Lo
      HINDI_SONGS_DATABASE[14], // Chaand Baaliyan
      HINDI_SONGS_DATABASE[9], // Tum Se Hi
    ]
  }
];

export const SPOTIFY_SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'user-library-read'
].join(' ');

export function getSpotifyAuthUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    show_dialog: 'true'
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function filterHindiTracks(spotifyTracks: any[], category: SongCategory = 'HINDI'): Song[] {
  return spotifyTracks.map((item: any, idx: number) => {
    const track = item.track || item;
    return {
      id: track.id || `sp_${idx}`,
      title: track.name,
      artist: track.artists ? track.artists.map((a: any) => a.name).join(', ') : 'Unknown Artist',
      movieOrAlbum: track.album ? track.album.name : undefined,
      year: track.album && track.album.release_date ? parseInt(track.album.release_date.substring(0, 4)) : undefined,
      audioUrl: track.preview_url || HINDI_SONGS_DATABASE[idx % HINDI_SONGS_DATABASE.length].audioUrl,
      coverUrl: track.album && track.album.images && track.album.images[0] ? track.album.images[0].url : undefined,
      spotifyUri: track.uri,
      spotifyId: track.id,
      popularity: track.popularity || 90,
      category
    };
  });
}
