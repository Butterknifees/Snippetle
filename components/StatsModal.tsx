'use client';

import React from 'react';
import { X, Trophy, Flame, Target, BarChart2 } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: number[];
  };
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  const maxGuessCount = Math.max(...stats.guessDistribution, 1);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-songless-dark border border-songless-tile w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-6 text-center">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-songless-subtext hover:text-white bg-songless-tile rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center space-x-2 text-amber-400 font-extrabold text-lg">
          <BarChart2 className="w-5 h-5" />
          <span>STATISTICS</span>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-2 bg-songless-tile/60 p-4 rounded-2xl border border-songless-tile">
          <div>
            <div className="text-xl font-black text-songless-text">{stats.played}</div>
            <div className="text-[10px] text-songless-subtext font-bold uppercase">Played</div>
          </div>
          <div>
            <div className="text-xl font-black text-emerald-400">{winPercentage}%</div>
            <div className="text-[10px] text-songless-subtext font-bold uppercase">Win %</div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 mr-0.5" />
              {stats.currentStreak}
            </div>
            <div className="text-[10px] text-songless-subtext font-bold uppercase">Streak</div>
          </div>
          <div>
            <div className="text-xl font-black text-songless-text">{stats.maxStreak}</div>
            <div className="text-[10px] text-songless-subtext font-bold uppercase">Max Streak</div>
          </div>
        </div>

        {/* Guess Distribution Histogram */}
        <div className="space-y-2 text-left">
          <h4 className="text-xs font-bold text-songless-subtext uppercase tracking-wider">
            Guess Distribution
          </h4>
          <div className="space-y-1.5 font-mono text-xs">
            {stats.guessDistribution.map((count, idx) => {
              const widthPct = Math.max(12, Math.round((count / maxGuessCount) * 100));
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="w-3 text-right text-songless-subtext font-bold">{idx + 1}</span>
                  <div
                    style={{ width: `${widthPct}%` }}
                    className={`py-1 px-2.5 rounded-lg font-bold text-[11px] text-black transition-all flex items-center justify-end ${
                      count > 0 ? 'bg-amber-400 shadow-sm' : 'bg-songless-tile text-songless-subtext'
                    }`}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
