import { Song, SongCategory } from './types';
import catalogData from '../expanded_catalog.json';

export const HINDI_SONGS_DATABASE: Song[] = catalogData.hindi as Song[];
export const ENGLISH_SONGS_DATABASE: Song[] = catalogData.english as Song[];

export function getSongsByCategory(category: SongCategory): Song[] {
  return category === 'HINDI' ? HINDI_SONGS_DATABASE : ENGLISH_SONGS_DATABASE;
}

// Pseudo-random number generator for deterministic daily selection across 3,000+ potential pool space
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function getDailyThreeSongs(category: SongCategory, dateStr?: string): Song[] {
  const pool = getSongsByCategory(category);
  const today = dateStr || new Date().toISOString().split('T')[0];
  
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed << 5) - seed + today.charCodeAt(i);
    seed |= 0;
  }
  if (category === 'ENGLISH') seed += 9999;

  const selected: Song[] = [];
  const pickedIndices = new Set<number>();
  let attempts = 0;

  while (selected.length < Math.min(3, pool.length)) {
    const rnd = seededRandom(seed + attempts);
    const index = Math.floor(rnd * pool.length);
    if (!pickedIndices.has(index)) {
      pickedIndices.add(index);
      selected.push(pool[index]);
    }
    attempts++;
  }

  return selected;
}
