'use client';

import React from 'react';
import { GameRoom, GamePlayer, GameRound } from '../../lib/types';
import { startNextRound } from '../../lib/roomEngine';
import { 
  Flame, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight, 
  Trophy, 
  Disc, 
  ExternalLink,
  Crown,
  Zap,
  Music2
} from 'lucide-react';

interface RoundRevealProps {
  room: GameRoom;
  currentPlayer: GamePlayer;
}

export const RoundReveal: React.FC<RoundRevealProps> = ({
  room,
  currentPlayer
}) => {
  const currentRound = room.currentRound;
  const song = currentRound?.song;
  const isHost = room.hostId === currentPlayer.id;
  const playersList = Object.values(room.players);

  const actualOwners = song?.owners || [];
  const isMultiOwner = actualOwners.length > 1;

  // Sorted leaderboard by total score
  const sortedPlayers = [...playersList].sort((a, b) => b.score - a.score);

  const isLastRound = (currentRound?.index || 0) + 1 >= (currentRound?.totalRounds || room.playlist.length);

  const handleNext = () => {
    startNextRound(room.code);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 pb-12">
      {/* 2X Multiplier Banner if Shared Track */}
      {isMultiOwner && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-black p-4 sm:p-5 rounded-3xl shadow-2xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black/20 rounded-2xl">
              <Flame className="w-7 h-7 fill-black" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                🔥 2X Multiplier Round!
              </div>
              <p className="text-xs sm:text-sm font-semibold opacity-90">
                Shared Top Track! {actualOwners.length} people in this room have this in their Top 30 songs!
              </p>
            </div>
          </div>
          <span className="text-2xl font-black bg-black text-amber-400 px-4 py-1.5 rounded-2xl">
            2X PTS
          </span>
        </div>
      )}

      {/* Song Reveal Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Album Cover */}
          <div className="relative group flex-shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-neutral-700 shadow-2xl bg-neutral-950">
              {song?.coverUrl ? (
                <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                  <Music2 className="w-12 h-12 text-neutral-400" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg">
              <Disc className="w-4 h-4 animate-spin" />
            </div>
          </div>

          {/* Song Info */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1 inline-block">
              Track Revealed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight line-clamp-2">
              {song?.title}
            </h2>
            <p className="text-base text-neutral-300 font-medium mt-1">
              {song?.artist}
            </p>
            {(song?.album || song?.year) && (
              <p className="text-xs text-neutral-400 mt-1">
                {song.album} {song.year ? `• ${song.year}` : ''}
              </p>
            )}

            {song?.spotifyUrl && (
              <a
                href={song.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#1DB954] hover:underline font-semibold mt-3"
              >
                Open in Spotify
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Who Actually Had the Song */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80">
          <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            Top 30 Track Belongs To:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {actualOwners.map((ownerId) => {
              const owner = room.players[ownerId];
              if (!owner) return null;
              return (
                <div
                  key={ownerId}
                  className="flex items-center gap-3 bg-amber-500/10 border-2 border-amber-400/80 px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-500/10 animate-bounce"
                >
                  <img src={owner.avatar} alt={owner.name} className="w-8 h-8 rounded-full object-cover border border-amber-400" />
                  <div>
                    <div className="text-sm font-black text-amber-300">
                      {owner.name}
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-bold uppercase">
                      Confirmed Owner ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Round Guesses Breakdown & Points */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          Round Guesses & Points
        </h3>

        <div className="space-y-3">
          {playersList.map((player) => {
            const guess = player.lastGuess;
            const isCorrect = guess?.isCorrect || false;
            const points = guess?.pointsEarned || 0;
            const timeTaken = guess?.timeTakenSec?.toFixed(1) || '0.0';

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/50'
                    : 'bg-neutral-950/40 border-neutral-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-700" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {player.name}
                      </span>
                      {player.id === currentPlayer.id && (
                        <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">You</span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                      Guessed: {guess?.selectedPlayerIds?.map(id => room.players[id]?.name).join(', ') || 'No guess'} 
                      {guess ? ` in ${timeTaken}s` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {isCorrect ? (
                    <div>
                      <span className="text-base sm:text-lg font-black text-emerald-400">
                        +{points} pts
                      </span>
                      {guess?.isMultiOwnerBonus && (
                        <span className="block text-[10px] font-bold text-amber-400 uppercase">
                          2x Bonus Applied!
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-neutral-500">
                      0 pts (Incorrect)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Scoreboard */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Live Leaderboard
        </h3>

        <div className="space-y-2.5">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                idx === 0
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-neutral-950/40 border-neutral-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-black text-sm ${
                  idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-neutral-300' : idx === 2 ? 'text-amber-600' : 'text-neutral-500'
                }`}>
                  #{idx + 1}
                </span>
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-bold text-white text-sm">
                  {player.name}
                </span>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-white font-mono">
                  {player.score.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-400 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Host Next Action */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {isLastRound ? 'All rounds complete!' : `Next: Round ${(currentRound?.index || 0) + 2}`}
          </span>

          {isHost ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition active:scale-95"
            >
              {isLastRound ? 'See Final Podium 🏆' : 'Next Song 🎵'}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-neutral-400 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800">
              Waiting for Host to continue...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
