'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameRoom, GamePlayer, GameRound } from '../../lib/types';
import { submitPlayerGuess, revealCurrentRound } from '../../lib/roomEngine';
import { AudioEngine } from '../../lib/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import { 
  Clock, 
  Users, 
  Check, 
  Send, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface RoundPlayerProps {
  room: GameRoom;
  currentPlayer: GamePlayer;
  audioEngine: AudioEngine;
}

export const RoundPlayer: React.FC<RoundPlayerProps> = ({
  room,
  currentPlayer,
  audioEngine
}) => {
  const currentRound = room.currentRound;
  const song = currentRound?.song;
  const isHost = room.hostId === currentPlayer.id;
  const playersList = Object.values(room.players);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(currentRound?.durationSec || 20);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(currentRound?.startTime || Date.now());

  // Check if player already submitted in room state
  useEffect(() => {
    if (currentPlayer.lastGuess) {
      setHasSubmitted(true);
      setSelectedPlayerIds(currentPlayer.lastGuess.selectedPlayerIds);
    } else {
      setHasSubmitted(false);
      setSelectedPlayerIds([]);
    }
  }, [currentPlayer.lastGuess, room.currentRoundIndex]);

  // Audio Playback on mount/round change
  useEffect(() => {
    if (song && song.audioUrl) {
      audioEngine.loadSong(song.audioUrl);
      audioEngine.playSnippet(currentRound?.durationSec || 20);
      setIsPlaying(true);
    }

    return () => {
      audioEngine.stop();
    };
  }, [song?.id, song?.audioUrl]);

  // Countdown timer loop
  useEffect(() => {
    const totalDuration = currentRound?.durationSec || 20;
    const start = currentRound?.startTime || Date.now();
    startTimeRef.current = start;

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, totalDuration - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Time expired! If host, trigger reveal
        if (isHost) {
          revealCurrentRound(room.code);
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRound?.startTime, currentRound?.durationSec, isHost, room.code]);

  // Multi-choice selection toggle
  const handleToggleSuspect = (playerId: string) => {
    if (hasSubmitted) return;

    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
    } else {
      setSelectedPlayerIds(prev => [...prev, playerId]);
    }
  };

  // Submit Guess
  const handleSubmitGuess = () => {
    if (selectedPlayerIds.length === 0 || hasSubmitted) return;

    const elapsed = Math.min(
      currentRound?.durationSec || 20,
      Math.max(0.1, (Date.now() - startTimeRef.current) / 1000)
    );

    setHasSubmitted(true);
    submitPlayerGuess(room.code, currentPlayer.id, selectedPlayerIds, elapsed);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    audioEngine.setVolume(isMuted ? 1.0 : 0.0);
  };

  const totalDuration = currentRound?.durationSec || 20;
  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
  const submittedCount = playersList.filter(p => !!p.lastGuess).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Status & Timer Bar */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-black uppercase tracking-wider">
              Round {(currentRound?.index || 0) + 1} of {currentRound?.totalRounds || room.playlist.length}
            </span>
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
              Speed Bonus: Up to 1,000 pts
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white">{submittedCount}</span> / {playersList.length} Guessed
            </div>

            <div className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-sm font-black font-mono border ${
              timeRemaining <= 5 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-bounce' 
                : 'bg-neutral-800 text-neutral-200 border-neutral-700'
            }`}>
              <Clock className="w-4 h-4" />
              {timeRemaining.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800/80">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              timeRemaining <= 5
                ? 'bg-gradient-to-r from-amber-500 to-red-500'
                : 'bg-gradient-to-r from-teal-400 via-emerald-500 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Audio Visualizer Card */}
      <AudioVisualizer
        isPlaying={isPlaying}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        trackTitle={room.settings.hideSongTitleDuringGuess ? undefined : song?.title}
        trackArtist={room.settings.hideSongTitleDuringGuess ? undefined : song?.artist}
        coverUrl={room.settings.hideSongTitleDuringGuess ? undefined : song?.coverUrl}
        hideDetails={room.settings.hideSongTitleDuringGuess}
      />

      {/* Multi-Choice Suspect Selection */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Whose Top Song is This?
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select one or multiple friends. If 2+ people share it, points are doubled (2x)!
            </p>
          </div>

          <span className="text-xs font-semibold text-neutral-400 bg-neutral-950 px-3 py-1 rounded-xl border border-neutral-800">
            Multi-Choice
          </span>
        </div>

        {/* Suspect Player Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-6">
          {playersList.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id);
            const isSelf = player.id === currentPlayer.id;

            return (
              <div
                key={player.id}
                onClick={() => handleToggleSuspect(player.id)}
                className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-200 flex items-center gap-4 ${
                  hasSubmitted
                    ? isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500 opacity-90'
                      : 'bg-neutral-950/40 border-neutral-800/60 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-lg shadow-emerald-500/15 ring-2 ring-emerald-500 scale-[1.02]'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80 active:scale-95'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-neutral-700"
                  />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black p-0.5 rounded-full shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Name & details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm truncate">
                      {player.name}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {player.spotifyUsername || 'Top 30 Songs'}
                  </span>
                </div>

                {/* Checkbox indicator */}
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-md'
                    : 'border-neutral-700 bg-neutral-900'
                }`}>
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lock In Guess Button / Status */}
        <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-400">
            {hasSubmitted ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                <Check className="w-4 h-4" />
                Guess submitted! Waiting for others to lock in...
              </span>
            ) : (
              <span>Select all suspects and click Lock In Guess to record your time.</span>
            )}
          </div>

          <button
            onClick={handleSubmitGuess}
            disabled={selectedPlayerIds.length === 0 || hasSubmitted}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl ${
              hasSubmitted
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : selectedPlayerIds.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black shadow-emerald-500/25 active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <Send className="w-4 h-4 fill-current" />
            {hasSubmitted ? 'Locked In ✓' : `Lock In Guess (${selectedPlayerIds.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};
