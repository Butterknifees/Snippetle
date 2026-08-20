'use client';

import React from 'react';
import { Play, Pause, FastForward, Sparkles } from 'lucide-react';
import { GUESS_DURATIONS, Song, getQuartileBadge } from '../lib/types';

interface AudioPlayerControlsProps {
  currentStep: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkip: () => void;
  playbackProgress: number;
  isGameOver: boolean;
  activeSong?: Song;
}

export const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({
  currentStep,
  isPlaying,
  onPlay,
  onPause,
  onSkip,
  playbackProgress,
  isGameOver,
  activeSong
}) => {
  const currentDuration = GUESS_DURATIONS[Math.min(currentStep, GUESS_DURATIONS.length - 1)];
  const maxDuration = 16.0;

  const quartileBadge = activeSong?.popularity ? getQuartileBadge(activeSong.popularity) : null;

  return (
    <div className="w-full max-w-xl mx-auto bg-songless-tile/40 backdrop-blur-xl border border-songless-tile/80 p-5 rounded-3xl space-y-4 shadow-2xl">
      {/* Quartile Popularity Header Badge */}
      {quartileBadge && (
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${quartileBadge.color}`}>
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Popularity Tier: {quartileBadge.label}</span>
          </div>
          <span className="text-songless-subtext font-mono">Step {Math.min(currentStep + 1, 6)} of 6</span>
        </div>
      )}

      {/* Multi-segment Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold text-songless-subtext px-1">
          <span>0s</span>
          <span className="text-white font-mono font-extrabold">{currentDuration}s Unlocked</span>
          <span>16s</span>
        </div>

        <div className="relative h-3.5 bg-songless-dark rounded-full overflow-hidden flex border border-songless-tile">
          {GUESS_DURATIONS.map((dur, idx) => {
            const prevDur = idx === 0 ? 0 : GUESS_DURATIONS[idx - 1];
            const segmentWidth = ((dur - prevDur) / maxDuration) * 100;
            const isUnlocked = idx <= currentStep || isGameOver;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                style={{ width: `${segmentWidth}%` }}
                className={`h-full border-r border-songless-dark/80 transition-all duration-300 relative ${
                  isUnlocked
                    ? isCurrent
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg'
                      : 'bg-songless-tileHover'
                    : 'bg-songless-dark/50 opacity-30'
                }`}
              />
            );
          })}

          {/* Active Audio Playback Fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-emerald-400 transition-all duration-75 shadow-lg"
            style={{
              width: `${(playbackProgress * (currentDuration / maxDuration)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Play / Skip Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onSkip}
          disabled={isGameOver}
          className="px-4 py-3 bg-songless-tile/90 hover:bg-songless-tileHover text-songless-subtext hover:text-white rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition border border-songless-tileHover disabled:opacity-40"
        >
          <FastForward className="w-4 h-4 text-amber-400" />
          <span>SKIP (+{GUESS_DURATIONS[Math.min(currentStep + 1, 5)] - currentDuration}s)</span>
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black rounded-full flex items-center justify-center shadow-xl shadow-amber-500/25 transform hover:scale-105 active:scale-95 transition"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-current text-black" />
          ) : (
            <Play className="w-7 h-7 fill-current text-black ml-1" />
          )}
        </button>

        <div className="text-right text-xs text-songless-subtext font-mono">
          <div className="text-white font-extrabold text-base">
            {currentDuration}s
          </div>
          <div className="text-[10px] text-songless-subtext uppercase">Snippet</div>
        </div>
      </div>
    </div>
  );
};
