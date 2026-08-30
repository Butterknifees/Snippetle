'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameRoom, GamePlayer } from '../../lib/types';
import { resetGameToLobby } from '../../lib/roomEngine';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  RotateCcw, 
  Heart, 
  Music, 
  Medal, 
  Flame,
  CheckCircle2
} from 'lucide-react';

interface GamePodiumProps {
  room: GameRoom;
  currentPlayer: GamePlayer;
}

export const GamePodium: React.FC<GamePodiumProps> = ({
  room,
  currentPlayer
}) => {
  const isHost = room.hostId === currentPlayer.id;
  const playersList = Object.values(room.players);
  const sortedPlayers = [...playersList].sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  // Confetti effect on mount
  useEffect(() => {
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Compute Taste Overlap (Musical Soulmates)
  const computeSoulmates = () => {
    const pairs: { p1: GamePlayer; p2: GamePlayer; count: number; commonSongs: string[] }[] = [];

    for (let i = 0; i < playersList.length; i++) {
      for (let j = i + 1; j < playersList.length; j++) {
        const p1 = playersList[i];
        const p2 = playersList[j];

        const p1SongTitles = new Set(p1.topSongs.map(s => s.title.toLowerCase().trim()));
        const common: string[] = [];

        p2.topSongs.forEach(s => {
          if (p1SongTitles.has(s.title.toLowerCase().trim())) {
            common.push(s.title);
          }
        });

        pairs.push({ p1, p2, count: common.length, commonSongs: common });
      }
    }

    return pairs.sort((a, b) => b.count - a.count);
  };

  const soulmatePairs = computeSoulmates();

  const handlePlayAgain = () => {
    resetGameToLobby(room.code);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-500 pb-16">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          Game Completed
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Victory Podium
        </h1>
        <p className="text-neutral-400 text-sm">
          Congratulations to our top music detective!
        </p>
      </div>

      {/* Top 3 Visual Podium */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-10 pb-4">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-[180px]">
            <div className="relative mb-2">
              <img
                src={second.avatar}
                alt={second.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-neutral-300 shadow-xl"
              />
              <div className="absolute -top-2 -right-2 bg-neutral-300 text-black font-black text-xs px-2 py-0.5 rounded-full shadow">
                #2
              </div>
            </div>
            <span className="font-bold text-white text-xs sm:text-sm truncate w-full text-center">
              {second.name}
            </span>
            <span className="text-xs text-neutral-400 font-mono font-bold">
              {second.score.toLocaleString()} pts
            </span>

            {/* Podium Bar */}
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-neutral-800 to-neutral-700 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-neutral-400 shadow-xl">
              <Medal className="w-8 h-8 text-neutral-300" />
            </div>
          </div>
        )}

        {/* 1st Place (Winner) */}
        {winner && (
          <div className="flex flex-col items-center flex-1 max-w-[160px] sm:max-w-[200px]">
            <div className="relative mb-2">
              <Crown className="w-8 h-8 text-amber-400 fill-amber-400 absolute -top-9 left-1/2 -translate-x-1/2 animate-bounce" />
              <img
                src={winner.avatar}
                alt={winner.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-amber-400 shadow-2xl ring-4 ring-amber-400/20"
              />
              <div className="absolute -top-2 -right-2 bg-amber-400 text-black font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg">
                #1
              </div>
            </div>
            <span className="font-extrabold text-amber-300 text-sm sm:text-base truncate w-full text-center">
              {winner.name}
            </span>
            <span className="text-xs text-amber-400/90 font-mono font-black">
              {winner.score.toLocaleString()} pts
            </span>

            {/* Podium Bar */}
            <div className="w-full h-40 sm:h-48 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-3xl mt-3 flex flex-col items-center justify-center border-t-4 border-amber-300 shadow-2xl">
              <Trophy className="w-10 h-10 text-black fill-black" />
              <span className="text-[10px] font-black text-black uppercase tracking-widest mt-1">
                Winner
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] sm:max-w-[180px]">
            <div className="relative mb-2">
              <img
                src={third.avatar}
                alt={third.name}
                className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-700 shadow-xl"
              />
              <div className="absolute -top-2 -right-2 bg-amber-700 text-white font-black text-xs px-2 py-0.5 rounded-full shadow">
                #3
              </div>
            </div>
            <span className="font-bold text-white text-xs sm:text-sm truncate w-full text-center">
              {third.name}
            </span>
            <span className="text-xs text-neutral-400 font-mono font-bold">
              {third.score.toLocaleString()} pts
            </span>

            {/* Podium Bar */}
            <div className="w-full h-20 sm:h-28 bg-gradient-to-t from-neutral-900 to-amber-900/60 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-amber-700 shadow-xl">
              <Medal className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        )}
      </div>

      {/* Musical Soulmates (Taste Overlap Section) */}
      {soulmatePairs.length > 0 && soulmatePairs[0].count > 0 && (
        <div className="bg-gradient-to-br from-purple-950/40 via-neutral-900/90 to-neutral-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400">
              <Heart className="w-6 h-6 fill-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Musical Soulmates (Top Track Overlaps)
              </h3>
              <p className="text-xs text-neutral-400">
                Discover which friends share the same taste in their Top 30 songs!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {soulmatePairs.slice(0, 4).map((pair, idx) => (
              <div
                key={idx}
                className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <img src={pair.p1.avatar} alt={pair.p1.name} className="w-10 h-10 rounded-full object-cover border-2 border-neutral-900" />
                    <img src={pair.p2.avatar} alt={pair.p2.name} className="w-10 h-10 rounded-full object-cover border-2 border-purple-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {pair.p1.name} & {pair.p2.name}
                    </div>
                    <span className="text-[11px] text-purple-400 font-medium">
                      {pair.count} shared {pair.count === 1 ? 'track' : 'tracks'} in Top 30
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl">
                  {Math.round((pair.count / 30) * 100)}% Match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Game Recap Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-emerald-400" />
          Songs Played Recap ({room.roundHistory.length} Tracks)
        </h3>

        <div className="space-y-2.5">
          {room.roundHistory.map((round, idx) => {
            const song = round.song;
            const owners = song.owners.map(id => room.players[id]?.name).filter(Boolean);
            const isShared = song.owners.length > 1;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/40 border border-neutral-800/80"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-neutral-400">
                    #{idx + 1}
                  </span>
                  {song.coverUrl && (
                    <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {song.title}
                      {isShared && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                          2X Round
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {song.artist} • Belongs to: <span className="text-emerald-400 font-semibold">{owners.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Play Again Button */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Ready for a rematch?
          </span>

          {isHost ? (
            <button
              onClick={handlePlayAgain}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              Play Again
            </button>
          ) : (
            <div className="text-xs text-neutral-400 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800">
              Waiting for Host to start a new game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
