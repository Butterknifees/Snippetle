import { GameRoom, GamePlayer, GameSong, PlayerGuess, GameRound, GameSettings } from './types';
import { resolveItunesAudio, enrichSongsWithAudio } from './itunesResolver';

const ROOM_STORAGE_PREFIX = 'whose_track_room_';
const BROADCAST_CHANNEL_NAME = 'whose_track_sync_channel';
export const DEFAULT_FIREBASE_PROJECT_ID = 'icebreakers-d26e7';

// In-memory active rooms cache
const localRooms = new Map<string, GameRoom>();

// BroadcastChannel for same-device cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

export type RoomUpdateListener = (room: GameRoom) => void;
const listeners = new Map<string, Set<RoomUpdateListener>>();

// Public Firebase settings (defaults to icebreakers-d26e7)
let firebaseConfig: { projectId?: string; databaseURL?: string } = {
  projectId: DEFAULT_FIREBASE_PROJECT_ID,
  databaseURL: `https://${DEFAULT_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
};

export function setCustomFirebaseConfig(config: { projectId?: string; databaseURL?: string }) {
  firebaseConfig = { ...firebaseConfig, ...config };
  if (typeof window !== 'undefined') {
    localStorage.setItem('whose_track_firebase_config', JSON.stringify(firebaseConfig));
  }
}

export function getCustomFirebaseConfig() {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('whose_track_firebase_config');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        firebaseConfig = { ...firebaseConfig, ...parsed };
      } catch (e) {
        // ignore
      }
    }
  }
  return firebaseConfig;
}

/**
 * Cloud sync fetcher: pulls room state from Firestore / Realtime DB
 */
async function fetchRemoteRoom(roomCode: string): Promise<GameRoom | null> {
  const code = roomCode.toUpperCase();
  const config = getCustomFirebaseConfig();
  const projectId = config.projectId || DEFAULT_FIREBASE_PROJECT_ID;

  // 1. Try Cloud Firestore REST API
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/rooms/${code}`;
    const res = await fetch(firestoreUrl);
    if (res.ok) {
      const doc = await res.json();
      if (doc.fields && doc.fields.data && doc.fields.data.stringValue) {
        return JSON.parse(doc.fields.data.stringValue);
      }
    }
  } catch (e) {
    // Firestore attempt finished
  }

  // 2. Try Realtime Database REST API
  if (config.databaseURL) {
    try {
      const rtdbUrl = `${config.databaseURL.replace(/\/$/, '')}/rooms/${code}.json`;
      const res = await fetch(rtdbUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          return data;
        }
      }
    } catch (e) {
      // RTDB attempt finished
    }
  }

  return null;
}

/**
 * Cloud sync writer: pushes room state to Firestore / Realtime DB
 */
async function pushRemoteRoom(room: GameRoom) {
  const code = room.code.toUpperCase();
  const config = getCustomFirebaseConfig();
  const projectId = config.projectId || DEFAULT_FIREBASE_PROJECT_ID;

  // 1. Push to Cloud Firestore
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/rooms/${code}`;
    const payload = {
      fields: {
        data: {
          stringValue: JSON.stringify(room)
        },
        updatedAt: {
          integerValue: Date.now().toString()
        },
        phase: {
          stringValue: room.phase
        }
      }
    };

    fetch(firestoreUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {
    // ignore
  }

  // 2. Push to Realtime Database
  if (config.databaseURL) {
    try {
      const rtdbUrl = `${config.databaseURL.replace(/\/$/, '')}/rooms/${code}.json`;
      fetch(rtdbUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }
}

export function subscribeToRoom(roomCode: string, callback: RoomUpdateListener): () => void {
  const code = roomCode.toUpperCase();
  if (!listeners.has(code)) {
    listeners.set(code, new Set());
  }
  listeners.get(code)!.add(callback);

  // Return initial room state if available locally
  const existing = getRoom(code);
  if (existing) {
    callback(existing);
  }

  // Initial cloud pull
  fetchRemoteRoom(code).then(remoteRoom => {
    if (remoteRoom) {
      localRooms.set(code, remoteRoom);
      notifyListeners(remoteRoom);
    }
  });

  // Polling loop for active cross-network synchronization
  let pollInterval: NodeJS.Timeout | null = null;
  if (typeof window !== 'undefined') {
    pollInterval = setInterval(async () => {
      const remote = await fetchRemoteRoom(code);
      if (remote) {
        const local = localRooms.get(code);
        // Update if remote has newer data or active phase change
        if (!local || JSON.stringify(local) !== JSON.stringify(remote)) {
          localRooms.set(code, remote);
          notifyListeners(remote);
        }
      }
    }, 1500);
  }

  return () => {
    if (pollInterval) clearInterval(pollInterval);
    const roomListeners = listeners.get(code);
    if (roomListeners) {
      roomListeners.delete(callback);
      if (roomListeners.size === 0) {
        listeners.delete(code);
      }
    }
  };
}

function notifyListeners(room: GameRoom) {
  const code = room.code.toUpperCase();
  const roomListeners = listeners.get(code);
  if (roomListeners) {
    roomListeners.forEach(cb => {
      try {
        cb(room);
      } catch (e) {
        console.error('Error in room listener callback:', e);
      }
    });
  }
}

// Cross-tab broadcast listener
if (typeof window !== 'undefined') {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'ROOM_UPDATED' && event.data.room) {
        const room: GameRoom = event.data.room;
        localRooms.set(room.code.toUpperCase(), room);
        notifyListeners(room);
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(ROOM_STORAGE_PREFIX) && e.newValue) {
      try {
        const room: GameRoom = JSON.parse(e.newValue);
        localRooms.set(room.code.toUpperCase(), room);
        notifyListeners(room);
      } catch (err) {
        // ignore parse error
      }
    }
  });
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createGameRoom(hostPlayer: GamePlayer, settings?: Partial<GameSettings>): GameRoom {
  const code = generateRoomCode();
  const initialSettings: GameSettings = {
    roundDurationSec: 20,
    totalRounds: 10,
    hideSongTitleDuringGuess: false,
    allowMultiSelect: true,
    ...settings
  };

  const room: GameRoom = {
    code,
    hostId: hostPlayer.id,
    createdAt: Date.now(),
    phase: 'LOBBY',
    settings: initialSettings,
    players: {
      [hostPlayer.id]: {
        ...hostPlayer,
        isHost: true,
        score: 0,
        currentStreak: 0
      }
    },
    playlist: [],
    currentRoundIndex: 0,
    roundHistory: []
  };

  saveRoom(room);
  return room;
}

export function getRoom(roomCode: string): GameRoom | null {
  const code = roomCode.toUpperCase();
  if (localRooms.has(code)) {
    return localRooms.get(code)!;
  }
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(ROOM_STORAGE_PREFIX + code);
    if (raw) {
      try {
        const parsed: GameRoom = JSON.parse(raw);
        localRooms.set(code, parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse room from storage:', e);
      }
    }
  }
  return null;
}

export async function saveRoom(room: GameRoom) {
  const code = room.code.toUpperCase();
  localRooms.set(code, room);
  if (typeof window !== 'undefined') {
    localStorage.setItem(ROOM_STORAGE_PREFIX + code, JSON.stringify(room));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ROOM_UPDATED', room });
    }
  }
  
  // Asynchronously push to Firebase Cloud (Firestore + RTDB)
  pushRemoteRoom(room);
  notifyListeners(room);
}

export function joinRoom(roomCode: string, player: GamePlayer): GameRoom | null {
  let room = getRoom(roomCode);
  if (!room) {
    room = {
      code: roomCode.toUpperCase(),
      hostId: player.id,
      createdAt: Date.now(),
      phase: 'LOBBY',
      settings: {
        roundDurationSec: 20,
        totalRounds: 10,
        hideSongTitleDuringGuess: false,
        allowMultiSelect: true
      },
      players: {},
      playlist: [],
      currentRoundIndex: 0,
      roundHistory: []
    };
  }

  const isHost = room.hostId === player.id || Object.keys(room.players).length === 0;
  if (isHost && !room.hostId) {
    room.hostId = player.id;
  }

  room.players[player.id] = {
    ...player,
    isHost,
    score: room.players[player.id]?.score || 0,
    currentStreak: room.players[player.id]?.currentStreak || 0
  };

  saveRoom(room);
  return room;
}

export function updatePlayer(roomCode: string, playerId: string, updates: Partial<GamePlayer>): GameRoom | null {
  const room = getRoom(roomCode);
  if (!room || !room.players[playerId]) return null;

  room.players[playerId] = {
    ...room.players[playerId],
    ...updates
  };

  saveRoom(room);
  return room;
}

export async function buildGamePlaylist(room: GameRoom): Promise<GameSong[]> {
  const songMap = new Map<string, GameSong>();

  Object.values(room.players).forEach(player => {
    player.topSongs.forEach(song => {
      const key = `${song.title.toLowerCase().trim()} - ${song.artist.toLowerCase().trim()}`;
      if (songMap.has(key)) {
        const existing = songMap.get(key)!;
        if (!existing.owners.includes(player.id)) {
          existing.owners.push(player.id);
        }
      } else {
        songMap.set(key, {
          ...song,
          owners: [player.id]
        });
      }
    });
  });

  const allPooled = Array.from(songMap.values());

  for (let i = allPooled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPooled[i], allPooled[j]] = [allPooled[j], allPooled[i]];
  }

  const sharedSongs = allPooled.filter(s => s.owners.length > 1);
  const singleSongs = allPooled.filter(s => s.owners.length === 1);
  const prioritized = [...sharedSongs, ...singleSongs];

  const maxRounds = room.settings.totalRounds || 10;
  const chosenPlaylist = prioritized.slice(0, maxRounds);

  const enriched = await enrichSongsWithAudio(chosenPlaylist);
  return enriched as GameSong[];
}

export async function startPreviewPhase(roomCode: string): Promise<GameRoom | null> {
  const room = getRoom(roomCode);
  if (!room) return null;

  const playlist = await buildGamePlaylist(room);
  room.playlist = playlist;
  room.phase = 'PREVIEW';
  room.currentRoundIndex = 0;

  saveRoom(room);
  return room;
}

export function startNextRound(roomCode: string): GameRoom | null {
  const room = getRoom(roomCode);
  if (!room || room.playlist.length === 0) return null;

  const nextIndex = room.phase === 'PREVIEW' ? 0 : room.currentRoundIndex + 1;

  if (nextIndex >= room.playlist.length) {
    room.phase = 'PODIUM';
    room.currentRound = undefined;
    saveRoom(room);
    return room;
  }

  const currentSong = room.playlist[nextIndex];
  const round: GameRound = {
    index: nextIndex,
    totalRounds: room.playlist.length,
    song: currentSong,
    startTime: Date.now(),
    durationSec: room.settings.roundDurationSec,
    isCompleted: false
  };

  Object.keys(room.players).forEach(pId => {
    delete room.players[pId].lastGuess;
  });

  room.phase = 'GUESSING';
  room.currentRoundIndex = nextIndex;
  room.currentRound = round;

  saveRoom(room);
  return room;
}

export function submitPlayerGuess(
  roomCode: string,
  playerId: string,
  selectedPlayerIds: string[],
  timeTakenSec: number
): GameRoom | null {
  const room = getRoom(roomCode);
  if (!room || room.phase !== 'GUESSING' || !room.currentRound) return null;

  const song = room.currentRound.song;
  const actualOwners = song.owners;

  const hasWrongSuspect = selectedPlayerIds.some(id => !actualOwners.includes(id));
  const hasAtLeastOneCorrect = selectedPlayerIds.some(id => actualOwners.includes(id));
  const isCorrect = !hasWrongSuspect && hasAtLeastOneCorrect && selectedPlayerIds.length > 0;

  const isMultiOwnerBonus = actualOwners.length > 1;

  let pointsEarned = 0;
  if (isCorrect) {
    const totalDuration = room.currentRound.durationSec;
    const remainingRatio = Math.max(0.1, (totalDuration - timeTakenSec) / totalDuration);
    let basePoints = Math.round(1000 * remainingRatio);
    if (isMultiOwnerBonus) {
      basePoints *= 2;
    }
    pointsEarned = basePoints;
  }

  const guess: PlayerGuess = {
    selectedPlayerIds,
    timeTakenSec,
    submittedAt: Date.now(),
    isCorrect,
    pointsEarned,
    isMultiOwnerBonus
  };

  const player = room.players[playerId];
  if (player) {
    player.lastGuess = guess;
    player.score += pointsEarned;
    if (isCorrect) {
      player.currentStreak = (player.currentStreak || 0) + 1;
    } else {
      player.currentStreak = 0;
    }
  }

  saveRoom(room);

  const allSubmitted = Object.values(room.players).every(p => !!p.lastGuess);
  if (allSubmitted) {
    revealCurrentRound(roomCode);
  }

  return room;
}

export function revealCurrentRound(roomCode: string): GameRoom | null {
  const room = getRoom(roomCode);
  if (!room || !room.currentRound) return null;

  room.phase = 'REVEAL';
  if (room.currentRound) {
    room.currentRound.isCompleted = true;
  }

  const guessesMap: Record<string, PlayerGuess> = {};
  Object.values(room.players).forEach(p => {
    if (p.lastGuess) {
      guessesMap[p.id] = p.lastGuess;
    }
  });

  room.roundHistory.push({
    roundIndex: room.currentRoundIndex,
    song: room.currentRound.song,
    guesses: guessesMap
  });

  saveRoom(room);
  return room;
}

export function resetGameToLobby(roomCode: string): GameRoom | null {
  const room = getRoom(roomCode);
  if (!room) return null;

  room.phase = 'LOBBY';
  room.currentRoundIndex = 0;
  room.currentRound = undefined;
  room.roundHistory = [];
  room.playlist = [];

  Object.values(room.players).forEach(p => {
    p.score = 0;
    p.currentStreak = 0;
    delete p.lastGuess;
    p.isReady = false;
  });

  saveRoom(room);
  return room;
}
