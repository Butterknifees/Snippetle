'use client';

import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, Music, Sparkles, Loader2 } from 'lucide-react';
import { Song, SongCategory, getQuartileBadge } from '../lib/types';
import { getSongsByCategory } from '../lib/hindiSongs';

interface SongSearchInputProps {
  onSelectSong: (song: Song) => void;
  isGameOver: boolean;
  category: SongCategory;
  poolSongs?: Song[];
}

export const SongSearchInput: React.FC<SongSearchInputProps> = ({
  onSelectSong,
  isGameOver,
  category,
  poolSongs
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const localSongsList = poolSongs || getSongsByCategory(category);
  const fuseRef = useRef<Fuse<Song> | null>(null);

  useEffect(() => {
    fuseRef.current = new Fuse(localSongsList, {
      keys: ['title', 'artist', 'movieOrAlbum'],
      threshold: 0.35,
      minMatchCharLength: 1
    });
  }, [localSongsList]);

  // Combined Fuse.js local search + Live iTunes Search Fallback
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // 1. Search local pool first
    const localMatches = fuseRef.current
      ? fuseRef.current.search(query).slice(0, 6).map(r => r.item)
      : [];

    setResults(localMatches);
    setIsOpen(localMatches.length > 0);

    // 2. If query >= 2 chars, fetch live API matches to ensure 100,000+ song availability
    if (query.trim().length >= 2) {
      setIsSearchingLive(true);
      const timer = setTimeout(async () => {
        try {
          const country = category === 'HINDI' ? 'IN' : 'US';
          const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8&country=${country}`;
          const res = await fetch(url).then(r => r.json());

          if (res.results && res.results.length > 0) {
            const liveSongs: Song[] = res.results
              .filter((item: any) => item.previewUrl)
              .map((item: any, idx: number) => ({
                id: `live_${item.trackId || idx}`,
                title: item.trackName,
                artist: item.artistName,
                movieOrAlbum: item.collectionName,
                year: item.releaseDate ? parseInt(item.releaseDate.substring(0, 4)) : undefined,
                audioUrl: item.previewUrl,
                coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : undefined,
                popularity: Math.floor(Math.random() * 50) + 50,
                category
              }));

            // Deduplicate local + live results by title & artist
            const combinedMap = new Map<string, Song>();
            localMatches.forEach(s => combinedMap.set(`${s.title.toLowerCase()}_${s.artist.toLowerCase()}`, s));
            liveSongs.forEach(s => {
              const key = `${s.title.toLowerCase()}_${s.artist.toLowerCase()}`;
              if (!combinedMap.has(key)) {
                combinedMap.set(key, s);
              }
            });

            const merged = Array.from(combinedMap.values()).slice(0, 8);
            setResults(merged);
            setIsOpen(merged.length > 0);
          }
        } catch (e) {
        } finally {
          setIsSearchingLive(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [query, category]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (song: Song) => {
    onSelectSong(song);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          disabled={isGameOver}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isGameOver ? "Completed - View results below" : `Search 100,000+ ${category === 'HINDI' ? 'Hindi' : 'English'} Songs...`}
          className="w-full bg-songless-tile/70 border border-songless-tileHover focus:border-amber-400 text-songless-text placeholder-songless-subtext px-4 py-4 pl-12 pr-16 rounded-2xl outline-none transition text-sm shadow-inner disabled:opacity-50"
        />
        <Search className="w-5 h-5 text-songless-subtext absolute left-4 top-4 pointer-events-none" />

        {isSearchingLive && (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-12 top-4" />
        )}

        {query && !isGameOver && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-3.5 text-xs text-songless-subtext hover:text-white bg-songless-dark px-2 py-1 rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && !isGameOver && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-songless-dark border border-songless-tile rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-songless-tile/50 max-h-80 overflow-y-auto">
          {results.map((song) => {
            const qBadge = song.popularity ? getQuartileBadge(song.popularity) : null;
            return (
              <button
                key={song.id}
                onClick={() => handleSelect(song)}
                className="w-full text-left px-4 py-3.5 hover:bg-songless-tile transition flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="p-2 bg-songless-tile group-hover:bg-amber-400/20 text-amber-400 rounded-xl">
                      <Music className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-songless-text truncate group-hover:text-amber-300">
                      {song.title}
                    </div>
                    <div className="text-xs text-songless-subtext truncate flex items-center space-x-2">
                      <span>{song.artist}</span>
                      {song.movieOrAlbum && (
                        <>
                          <span>•</span>
                          <span className="truncate">{song.movieOrAlbum}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {qBadge && (
                  <div className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 border ${qBadge.color}`}>
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>{qBadge.tier}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
