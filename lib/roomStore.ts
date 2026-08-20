import { GroupRoom, Song, SpotifyUser } from './types';
import { MOCK_SPOTIFY_USERS } from './spotify';
import { HINDI_SONGS_DATABASE } from './hindiSongs';

const STORAGE_KEY = 'songless_group_room';

export function createRoom(hostUser: SpotifyUser): GroupRoom {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room: GroupRoom = {
    code,
    hostId: hostUser.id,
    users: [hostUser],
    playlist: generateGroupPlaylist([hostUser]),
    activeSongIndex: 0
  };
  saveRoom(room);
  return room;
}

export function generateGroupPlaylist(users: SpotifyUser[]): Song[] {
  const songMap = new Map<string, Song>();
  
  // Aggregate songs from all connected Spotify accounts
  users.forEach(u => {
    u.topTracks.forEach(song => {
      songMap.set(song.title.toLowerCase().trim(), song);
    });
  });

  // If pooled tracks are fewer than 5, supplement with curated Hindi database
  if (songMap.size < 5) {
    HINDI_SONGS_DATABASE.forEach(song => {
      if (!songMap.has(song.title.toLowerCase().trim())) {
        songMap.set(song.title.toLowerCase().trim(), song);
      }
    });
  }

  // Shuffle combined playlist
  const pooled = Array.from(songMap.values());
  for (let i = pooled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pooled[i], pooled[j]] = [pooled[j], pooled[i]];
  }

  return pooled.slice(0, 10);
}

export function saveRoom(room: GroupRoom) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(room));
  }
}

export function getSavedRoom(): GroupRoom | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export function addMockUserToRoom(room: GroupRoom): GroupRoom {
  const currentCount = room.users.length;
  if (currentCount >= 5) return room;

  const availableMocks = MOCK_SPOTIFY_USERS.filter(m => !room.users.some(u => u.id === m.id));
  if (availableMocks.length === 0) return room;

  const newUser = availableMocks[0];
  const updatedUsers = [...room.users, newUser];
  const updatedRoom: GroupRoom = {
    ...room,
    users: updatedUsers,
    playlist: generateGroupPlaylist(updatedUsers)
  };
  saveRoom(updatedRoom);
  return updatedRoom;
}
