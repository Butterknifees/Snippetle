'use client';

import React from 'react';
import { Check, X, FastForward, Lock, UserCheck } from 'lucide-react';
import { GuessAttempt, GUESS_DURATIONS } from '../lib/types';

interface GuessTimelineProps {
  attempts: GuessAttempt[];
  currentStep: number;
}

export const GuessTimeline: React.FC<GuessTimelineProps> = ({
  attempts,
  currentStep
}) => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-2">
      {Array.from({ length: 6 }).map((_, idx) => {
        const attempt = attempts[idx];
        const duration = GUESS_DURATIONS[idx];
        const isCurrent = idx === currentStep;

        if (!attempt || attempt.status === 'NONE') {
          return (
            <div
              key={idx}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-all ${
                isCurrent
                  ? 'bg-songless-tile/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
                  : 'bg-songless-dark/60 border-songless-tile/50 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3 text-xs text-songless-subtext font-mono">
                <span className="w-5 h-5 rounded-full bg-songless-tile flex items-center justify-center font-bold text-songless-text">
                  {idx + 1}
                </span>
                <span>{duration}s snippet</span>
              </div>
              {isCurrent ? (
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider animate-pulse">
                  Current Step
                </span>
              ) : (
                <Lock className="w-3.5 h-3.5 text-songless-subtext/40" />
              )}
            </div>
          );
        }

        if (attempt.status === 'CORRECT') {
          return (
            <div
              key={idx}
              className="w-full py-3 px-4 rounded-xl bg-songless-correct text-white flex items-center justify-between font-bold text-sm shadow-md animate-bounce-short"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Check className="w-5 h-5 p-0.5 bg-black/20 rounded-full flex-shrink-0" />
                <span className="truncate">{attempt.guess || "Correct Song!"}</span>
              </div>
              <span className="text-xs bg-black/20 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
                {duration}s
              </span>
            </div>
          );
        }

        if (attempt.status === 'ARTIST_CORRECT') {
          return (
            <div
              key={idx}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 text-black flex items-center justify-between font-bold text-sm shadow-md"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <UserCheck className="w-5 h-5 p-0.5 bg-black/10 rounded-full flex-shrink-0 text-black" />
                <div className="truncate">
                  <span>{attempt.guess}</span>
                  <span className="ml-2 text-[10px] bg-black/20 text-black px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                    Correct Artist!
                  </span>
                </div>
              </div>
              <span className="text-xs bg-black/10 px-2 py-0.5 rounded font-mono">
                {duration}s
              </span>
            </div>
          );
        }

        if (attempt.status === 'SKIPPED') {
          return (
            <div
              key={idx}
              className="w-full py-3 px-4 rounded-xl bg-songless-tile text-songless-subtext flex items-center justify-between font-bold text-sm shadow-md border border-songless-tileHover"
            >
              <div className="flex items-center space-x-3">
                <FastForward className="w-4 h-4 p-0.5 bg-black/10 rounded-full flex-shrink-0" />
                <span className="uppercase tracking-wider">SKIPPED</span>
              </div>
              <span className="text-xs bg-black/10 px-2 py-0.5 rounded font-mono">
                {duration}s
              </span>
            </div>
          );
        }

        // INCORRECT
        return (
          <div
            key={idx}
            className="w-full py-3 px-4 rounded-xl bg-songless-wrong text-white flex items-center justify-between font-medium text-sm shadow-md"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <X className="w-5 h-5 p-0.5 bg-black/20 rounded-full flex-shrink-0 text-white" />
              <span className="line-through text-white/90 truncate">{attempt.guess}</span>
            </div>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono text-white/80">
              {duration}s
            </span>
          </div>
        );
      })}
    </div>
  );
};
