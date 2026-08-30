'use client';

import React, { useState } from 'react';
import { GameRoom, GamePlayer, GameSong } from '../../lib/types';
import { updatePlayer, startNextRound } from '../../lib/roomEngine';
import { AudioEngine } from '../../lib/audioEngine';
import { 
  Sparkles, 
  Play, 
  Pause, 
  Music, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Check, 
  Users,
  Disc3
} from 'lucide-react';

interface TopSongsPreviewProps {
  room: GameRoom;
  currentPlayer: GamePlayer;
  audioEngine: AudioEngine;
}

export const TopSongsPreview: React.FC<TopSongsPreviewProps> = ({
  room,
  currentPlayer,
  audioEngine
}) => {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const isHost = room.hostId === currentPlayer.id;
  const playersList = Object.values(room.players);
  const mySongs = currentPlayer.topSongs || [];

  // Calculate shared overlap tracks
  const sharedSongsCount = room.playlist.filter(s => s.owners.length > 1).length;

  const handleTestAudio = (song: GameSong) => {
    if (playingSongId === song.id) {
      audioEngine.stop();
      setPlayingSongId(null);
    } else {
      if (song.audioUrl) {
        audioEngine.loadSong(song.audioUrl);
        audioEngine.playSnippet(8);
        setPlayingSongId(song.id);
      }
    }
  };

  const handleToggleReady = () => {
    updatePlayer(room.code, currentPlayer.id, {
      isReady: !currentPlayer.isReady
    });
  };

  const handleLaunchGame = () => {
    audioEngine.stop();
    startNextRound(room.code);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Pre-Game Roster Preview
              </span>
              {sharedSongsCount > 0 && (
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 animate-pulse" />
                  {sharedSongsCount} Overlapping Songs (2x Multipliers Active!)
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Here Are Your Top 30 Songs!
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              These are the tracks representing you in this game. Other players will listen to snippets and guess if it's yours!
            </p>
          </div>

          {/* Action Ready / Start Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleToggleReady}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all border ${
                currentPlayer.isReady
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentPlayer.isReady ? 'You Are Ready!' : 'Mark as Ready'}
            </button>

            {isHost && (
              <button
                onClick={handleLaunchGame}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95"
              >
                Launch Round 1
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Players Ready Status Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Users className="w-4 h-4 text-purple-400" />
          <span>Party Status:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {playersList.map(p => (
            <div key={p.id} className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
              <img src={p.avatar} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
              <span className="text-xs font-semibold text-white">{p.name}</span>
              {p.isReady ? (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Ready ✓</span>
              ) : (
                <span className="text-[10px] text-neutral-500">Reviewing...</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 30 Songs Grid */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">
              Your Roster ({mySongs.length} Tracks)
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Click any play icon to test a preview clip
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mySongs.map((song, index) => {
            const isPlaying = playingSongId === song.id;
            return (
              <div
                key={song.id || index}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isPlaying
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-neutral-950/50 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                {/* Index / Cover */}
                <div className="relative group flex-shrink-0">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                      <Disc3 className="w-5 h-5 text-neutral-400" />
                    </div>
                  )}

                  {/* Play overlay button */}
                  <button
                    onClick={() => handleTestAudio(song)}
                    className={`absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center transition-opacity ${
                      isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                    ) : (
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Song info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-neutral-400 w-4">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-white text-xs truncate">
                      {song.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate pl-5">
                    {song.artist}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
