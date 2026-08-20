'use client';

import React from 'react';
import { Music2, Users, BarChart2, Volume2, VolumeX, Globe, Sparkles } from 'lucide-react';
import { SongCategory } from '../lib/types';

interface NavbarProps {
  category: SongCategory;
  setCategory: (c: SongCategory) => void;
  mode: 'DAILY' | 'GROUP';
  setMode: (m: 'DAILY' | 'GROUP') => void;
  openGroupModal: () => void;
  openStatsModal: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  dailyProgressCount: number; // 0, 1, 2, 3
}

export const Navbar: React.FC<NavbarProps> = ({
  category,
  setCategory,
  mode,
  setMode,
  openGroupModal,
  openStatsModal,
  isMuted,
  toggleMute,
  dailyProgressCount
}) => {
  return (
    <header className="w-full bg-songless-dark/90 backdrop-blur-md border-b border-songless-tile/60 py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xl">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <Music2 className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-2xl tracking-tight text-white font-sans">
              SNIPPETLE
            </span>
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {category}
            </span>
          </div>
          <p className="text-[11px] text-songless-subtext hidden sm:block font-medium">
            Guess the song from just 0.1s
          </p>
        </div>
      </div>

      {/* Center Category & Mode Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Category Pill Toggle */}
        <div className="bg-songless-tile/80 p-1 rounded-2xl flex items-center border border-songless-tileHover shadow-inner">
          <button
            onClick={() => setCategory('HINDI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              category === 'HINDI'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-songless-subtext hover:text-white'
            }`}
          >
            <span>🇮🇳</span>
            <span>Hindi</span>
          </button>
          <button
            onClick={() => setCategory('ENGLISH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
              category === 'ENGLISH'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-songless-subtext hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>English</span>
          </button>
        </div>

        {/* Daily vs Group Mode */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => setMode('DAILY')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'DAILY'
                ? 'bg-songless-blue text-white shadow-md'
                : 'text-songless-subtext hover:text-white'
            }`}
          >
            Daily 3 Songs ({dailyProgressCount}/3)
          </button>
          <button
            onClick={() => {
              setMode('GROUP');
              openGroupModal();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
              mode === 'GROUP'
                ? 'bg-songless-spotify text-black shadow-md'
                : 'text-songless-subtext hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Spotify Group</span>
          </button>
        </div>
      </div>

      {/* Mute & Stats Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="p-2.5 text-songless-subtext hover:text-white bg-songless-tile hover:bg-songless-tileHover rounded-xl transition border border-songless-tileHover"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={openStatsModal}
          className="p-2.5 text-songless-subtext hover:text-white bg-songless-tile hover:bg-songless-tileHover rounded-xl transition border border-songless-tileHover"
          title="Statistics"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
