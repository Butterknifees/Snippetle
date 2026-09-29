import { Song, SongCategory, HindiGenre, getISTDateString } from './types';
import catalogData from '../categorized_catalog.json';

export const HINDI_POP_DATABASE: Song[] = catalogData.hPop as Song[];
export const HINDI_RETRO_DATABASE: Song[] = catalogData.hRetro as Song[];
export const HINDI_RAP_DATABASE: Song[] = catalogData.hRap as Song[];
export const ENGLISH_SONGS_DATABASE: Song[] = catalogData.eng as Song[];

// Alias for roomStore & spotify compatibility
export const HINDI_SONGS_DATABASE: Song[] = HINDI_POP_DATABASE;

export function getSongsByCategory(category: SongCategory): Song[] {
  return category === 'ENGLISH' ? ENGLISH_SONGS_DATABASE : HINDI_POP_DATABASE;
}

export function getSongsByCategoryAndGenre(category: SongCategory, genre: HindiGenre = 'POP'): Song[] {
  if (category === 'ENGLISH') {
    return ENGLISH_SONGS_DATABASE;
  }
  if (genre === 'RETRO') return HINDI_RETRO_DATABASE;
  if (genre === 'RAP') return HINDI_RAP_DATABASE;
  return HINDI_POP_DATABASE;
}

// FNV-1a string hash, used only to seed the PRNG below
function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Mulberry32 PRNG: well-mixed output for small modulo ranges
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SONGS_PER_DAY = 3;
const NO_REPEAT_DAYS = 7;
const ROTATION_EPOCH_UTC = Date.UTC(2025, 0, 1);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysSinceEpoch(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return Math.max(0, Math.round((Date.UTC(year, month - 1, day) - ROTATION_EPOCH_UTC) / MS_PER_DAY));
}

// Deterministic shuffled rotation: songs are dealt from a sequence of shuffled
// "cycles" of the full pool, SONGS_PER_DAY per day. Every song plays once per
// cycle before any song repeats, and each new cycle is ordered so that a song
// from the end of the previous cycle can't come back within NO_REPEAT_DAYS
// (or within 2/3 of the pool, for pools too small to cover that window).
const cycleCache = new Map<string, Song[][]>();

function getRotationCycles(pool: Song[], seedKey: string, cyclesNeeded: number): Song[][] {
  const ordered = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const cacheKey = `${seedKey}_${ordered.map(s => s.id).join(',')}`;
  const cycles = cycleCache.get(cacheKey) ?? [];

  const n = ordered.length;
  // Minimum number of plays between two plays of the same song
  const minGap = Math.min(NO_REPEAT_DAYS * SONGS_PER_DAY, Math.max(SONGS_PER_DAY, Math.floor((n * 2) / 3)));
  while (cycles.length < cyclesNeeded) {
    const rand = mulberry32(fnv1aHash(`${seedKey}_cycle_${cycles.length}`));
    const shuffled = [...ordered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const prev = cycles[cycles.length - 1];
    if (!prev) {
      cycles.push(shuffled);
      continue;
    }

    // Greedily take the next shuffled song that is far enough from its previous play.
    // A song at position p of the previous cycle is n - p + q plays away at position q.
    const prevPos = new Map(prev.map((s, i) => [s.id, i]));
    const remaining = [...shuffled];
    const next: Song[] = [];
    for (let q = 0; q < n; q++) {
      let pick = remaining.findIndex(s => n - prevPos.get(s.id)! + q >= minGap);
      if (pick === -1) pick = 0;
      next.push(remaining.splice(pick, 1)[0]);
    }
    cycles.push(next);
  }

  cycleCache.set(cacheKey, cycles);
  return cycles;
}

// Daily selection of 3 unique songs; a song only repeats after the whole pool has been played
export function getDailyThreeSongs(category: SongCategory, genre: HindiGenre = 'POP', dateStr?: string): Song[] {
  const pool = getSongsByCategoryAndGenre(category, genre);
  if (pool.length === 0) return [];

  const targetDateStr = dateStr || getISTDateString();
  const seedKey = `${category}_${category === 'HINDI' ? genre : 'ALL'}`;
  const count = Math.min(SONGS_PER_DAY, pool.length);
  const start = daysSinceEpoch(targetDateStr) * SONGS_PER_DAY;
  const cycles = getRotationCycles(pool, seedKey, Math.floor((start + count - 1) / pool.length) + 1);

  const selected: Song[] = [];
  for (let pos = start; pos < start + count; pos++) {
    selected.push(cycles[Math.floor(pos / pool.length)][pos % pool.length]);
  }
  return selected;
}
