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

// Pseudo-random hash generator for deterministic daily selection
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Daily selection of 3 unique songs resetting strictly at IST Midnight
export function getDailyThreeSongs(category: SongCategory, genre: HindiGenre = 'POP', dateStr?: string): Song[] {
  const pool = getSongsByCategoryAndGenre(category, genre);
  const istDateStr = dateStr || getISTDateString(); // YYYY-MM-DD in IST
  
  let seed = 0;
  const key = `${category}_${genre}_${istDateStr}`;
  for (let i = 0; i < key.length; i++) {
    seed = (seed << 5) - seed + key.charCodeAt(i);
    seed |= 0;
  }

  const selected: Song[] = [];
  const pickedIndices = new Set<number>();
  let attempt = 0;

  while (selected.length < Math.min(3, pool.length)) {
    const rnd = seededRandom(seed + attempt * 31);
    const index = Math.floor(rnd * pool.length);
    if (!pickedIndices.has(index)) {
      pickedIndices.add(index);
      selected.push(pool[index]);
    }
    attempt++;
  }

  return selected;
}
