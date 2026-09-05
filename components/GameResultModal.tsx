'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Play, Pause, Share2, Check, RefreshCw, Trophy, Clock, Sparkles } from 'lucide-react';
import { Song, GuessAttempt, SongCategory, HindiGenre, getQuartileBadge } from '../lib/types';

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSong: Song;
  isWon: boolean;
  attempts: GuessAttempt[];
  onPlayFullSong: () => void;
  onPauseFullSong: () => void;
  isPlayingFull: boolean;
  onNextSong: () => void;
  dailySongIndex: number; // 0, 1, 2
  isDailyCompleted: boolean;
  category: SongCategory;
  hindiGenre?: HindiGenre;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  onClose,
  targetSong,
  isWon,
  attempts,
  onPlayFullSong,
  onPauseFullSong,
  isPlayingFull,
  onNextSong,
  dailySongIndex,
  isDailyCompleted,
  category,
  hindiGenre
}) => {
  const [shared, setShared] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  // Calculate countdown specifically to 00:00:00 IST (UTC+5:30)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // IST time
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      const istNow = new Date(utcMs + (5.5 * 60 * 60 * 1000));
      
      const istTomorrow = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate() + 1, 0, 0, 0);
      const diffMs = istTomorrow.getTime() - istNow.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  if (isWon && typeof window !== 'undefined') {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  }

  const generateEmojiShareGrid = () => {
    const emojis = attempts.map(a => {
      if (a.status === 'CORRECT') return '🟩';
      if (a.status === 'ARTIST_CORRECT') return '🟨';
      if (a.status === 'SKIPPED') return '⬛';
      if (a.status === 'INCORRECT') return '🟥';
      return '⬛';
    }).join('');

    const genreTag = category === 'HINDI' ? `Hindi ${hindiGenre}` : 'English';
    return `Snippetle 🎵 (${genreTag})\n${isWon ? `Guessed in ${attempts.length}/6 attempts! 🎉` : 'Defeated! ❌'}\n${emojis}\nPlay: https://butterknifees.github.io/Snippetle/`;
  };

  const handleShare = () => {
    const text = generateEmojiShareGrid();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const quartileBadge = targetSong.popularity ? getQuartileBadge(targetSong.popularity) : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-songless-dark border border-songless-tile w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-5 text-center">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-songless-subtext hover:text-white bg-songless-tile rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Victory/Defeat Banner */}
        <div className="space-y-1">
          {isWon ? (
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 font-extrabold text-xs px-4 py-1.5 rounded-full border border-emerald-500/30">
              <Trophy className="w-4 h-4" />
              <span>BRILLIANT GUESS!</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 bg-rose-500/20 text-rose-400 font-extrabold text-xs px-4 py-1.5 rounded-full border border-rose-500/30">
              <span>NICE TRY!</span>
            </div>
          )}
          <h2 className="text-2xl font-black text-white tracking-tight pt-1">
            {isWon ? "You Nailed It!" : "The Song Was..."}
          </h2>
        </div>

        {/* Album Cover & Song Details */}
        <div className="bg-songless-tile/80 p-4 rounded-2xl border border-songless-tile flex flex-col items-center space-y-3 shadow-inner">
          {targetSong.coverUrl ? (
            <img
              src={targetSong.coverUrl}
              alt={targetSong.title}
              className="w-36 h-36 rounded-2xl object-cover shadow-2xl border border-songless-tileHover"
            />
          ) : (
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-2xl">
              🎵
            </div>
          )}

          <div>
            <h3 className="text-lg font-black text-white">
              {targetSong.title}
            </h3>
            <p className="text-xs font-semibold text-amber-400">
              {targetSong.artist}
            </p>
            {targetSong.movieOrAlbum && (
              <p className="text-xs text-songless-subtext mt-0.5">
                From <span className="text-white italic">{targetSong.movieOrAlbum}</span> ({targetSong.year})
              </p>
            )}

            {/* Quartile Popularity Badge */}
            {quartileBadge && (
              <div className={`inline-flex items-center space-x-1.5 text-[11px] font-bold px-3 py-1 rounded-full mt-2 border ${quartileBadge.color}`}>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Popularity: {quartileBadge.label}</span>
              </div>
            )}
          </div>

          <button
            onClick={isPlayingFull ? onPauseFullSong : onPlayFullSong}
            className="w-full py-3 bg-songless-tileHover hover:bg-amber-400 hover:text-black text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition"
          >
            {isPlayingFull ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Full Song</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Listen to Full Song</span>
              </>
            )}
          </button>
        </div>

        {/* Daily Challenge 3-Song Status */}
        {isDailyCompleted ? (
          <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Daily Challenge Complete (3/3)</span>
            </div>
            <p className="text-[11px] text-songless-subtext">
              You played all 3 daily songs for {category === 'HINDI' ? `Hindi ${hindiGenre}` : 'English'}. Next set unlocks at IST Midnight in:
            </p>
            <div className="text-xl font-black font-mono text-white tracking-widest pt-0.5">
              {countdown}
            </div>
          </div>
        ) : (
          <div className="text-xs text-songless-subtext font-semibold">
            Daily Progress: <span className="text-amber-400 font-bold">Song {dailySongIndex + 1} of 3</span>
          </div>
        )}

        {/* Share Emoji Grid */}
        <div className="bg-songless-dark/80 p-3 rounded-xl border border-songless-tile text-center font-mono text-sm tracking-widest text-songless-subtext">
          {attempts.map(a => {
            if (a.status === 'CORRECT') return '🟩';
            if (a.status === 'ARTIST_CORRECT') return '🟨';
            if (a.status === 'SKIPPED') return '⬛';
            if (a.status === 'INCORRECT') return '🟥';
            return '⬛';
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 bg-songless-blue hover:bg-blue-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg"
          >
            {shared ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied Result!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Score</span>
              </>
            )}
          </button>

          {!isDailyCompleted && (
            <button
              onClick={() => {
                onNextSong();
                onClose();
              }}
              className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Next Song ({dailySongIndex + 2}/3)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
