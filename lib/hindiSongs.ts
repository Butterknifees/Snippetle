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

// High-Entropy FNV-1a Hash for uniform daily distribution without clustering
function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Helper to calculate raw 3 song IDs for a specific date string without anti-repeat recursion
function getRawDailySongIds(pool: Song[], category: SongCategory, genre: HindiGenre, dateStr: string): Set<string> {
  const baseKey = `${category}_${genre}_${dateStr}`;
  const pickedIds = new Set<string>();
  let attempt = 0;

  while (pickedIds.size < Math.min(3, pool.length)) {
    const hashVal = fnv1aHash(`${baseKey}_attempt_${attempt}`);
    const index = hashVal % pool.length;
    pickedIds.add(pool[index].id);
    attempt++;
  }

  return pickedIds;
}

// Daily selection of 3 unique songs with a strict 7-day anti-repeat filter
export function getDailyThreeSongs(category: SongCategory, genre: HindiGenre = 'POP', dateStr?: string): Song[] {
  const fullPool = getSongsByCategoryAndGenre(category, genre);
  const targetDateStr = dateStr || getISTDateString();
  
  // 1. Gather song IDs picked over the past 7 days to exclude them
  const recent7DaysSongIds = new Set<string>();
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDateObj = new Date(Date.UTC(year, month - 1, day));

  for (let offset = 1; offset <= 7; offset++) {
    const prevDateObj = new Date(targetDateObj.getTime() - offset * 24 * 60 * 60 * 1000);
    const prevYear = prevDateObj.getUTCFullYear();
    const prevMonth = String(prevDateObj.getUTCMonth() + 1).padStart(2, '0');
    const prevDay = String(prevDateObj.getUTCDate()).padStart(2, '0');
    const prevDateStr = `${prevYear}-${prevMonth}-${prevDay}`;

    const prevIds = getRawDailySongIds(fullPool, category, genre, prevDateStr);
    prevIds.forEach(id => recent7DaysSongIds.add(id));
  }

  // 2. Filter pool to exclude songs played in the last 7 days
  const eligiblePool = fullPool.filter(song => !recent7DaysSongIds.has(song.id));
  const activePool = eligiblePool.length >= 3 ? eligiblePool : fullPool;

  // 3. Pick 3 songs for targetDateStr from activePool
  const baseKey = `${category}_${genre}_${targetDateStr}`;
  const selected: Song[] = [];
  const pickedIndices = new Set<number>();
  let attempt = 0;

  while (selected.length < Math.min(3, activePool.length)) {
    const hashVal = fnv1aHash(`${baseKey}_attempt_${attempt}`);
    const index = hashVal % activePool.length;
    
    if (!pickedIndices.has(index)) {
      pickedIndices.add(index);
      selected.push(activePool[index]);
    }
    attempt++;
  }

  return selected;
}
