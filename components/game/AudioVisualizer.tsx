'use client';

import React from 'react';
import { Disc3, Music2, Volume2, VolumeX } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  trackTitle?: string;
  trackArtist?: string;
  coverUrl?: string;
  hideDetails?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  isMuted = false,
  onToggleMute,
  trackTitle,
  trackArtist,
  coverUrl,
  hideDetails = false
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 border border-neutral-800/80 p-6 shadow-2xl backdrop-blur-xl">
      {/* Background glow */}
      <div className={`absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl transition-opacity duration-700 ${isPlaying ? 'opacity-100 scale-110' : 'opacity-30'}`} />
      <div className={`absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl transition-opacity duration-700 ${isPlaying ? 'opacity-100 scale-110' : 'opacity-30'}`} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Spinning Vinyl / Cover Art */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            {/* Spinning Vinyl Record */}
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neutral-950 border-4 border-neutral-800 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-700 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
              {/* Vinyl grooves */}
              <div className="absolute inset-2 rounded-full border border-neutral-800/50" />
              <div className="absolute inset-4 rounded-full border border-neutral-800/60" />
              <div className="absolute inset-6 rounded-full border border-neutral-800/70" />
              
              {/* Center label / Cover art */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-700 bg-neutral-800 flex items-center justify-center">
                {coverUrl && !hideDetails ? (
                  <img src={coverUrl} alt="Album Art" className="w-full h-full object-cover" />
                ) : (
                  <Music2 className={`w-5 h-5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
                )}
              </div>
            </div>

            {/* Needle indicator badge */}
            <div className="absolute -top-1 -right-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full p-1.5 backdrop-blur-md">
              <Disc3 className={`w-4 h-4 text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
          </div>

          {/* Track Info (Hidden or Shown depending on phase/settings) */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${isPlaying ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' : 'bg-neutral-800 text-neutral-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
                {isPlaying ? 'Now Playing 30s Snippet' : 'Audio Ready'}
              </span>
            </div>

            {hideDetails ? (
              <div>
                <h3 className="text-xl font-bold text-neutral-200 tracking-wide">
                  🎵 Mystery Track
                </h3>
                <p className="text-sm text-neutral-400">
                  Listen closely & guess who has this in their top 30!
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-white line-clamp-1">
                  {trackTitle || 'Preview Track'}
                </h3>
                <p className="text-sm text-neutral-400 line-clamp-1">
                  {trackArtist || 'Various Artists'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Dancing Equalizer Bars + Mute control */}
        <div className="flex items-center gap-4">
          <div className="flex items-end gap-1.5 h-12 px-4 py-2 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            {[40, 75, 100, 60, 85, 45, 90, 70, 95, 50, 80, 65].map((height, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 transition-all duration-300 ${
                  isPlaying ? 'opacity-100' : 'opacity-25'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(15, (height * (0.4 + 0.6 * Math.sin((i + Date.now() / 200) * 0.8))))}%` : '20%',
                  animation: isPlaying ? `bounce 0.8s ease-in-out infinite alternate ${i * 0.08}s` : 'none'
                }}
              />
            ))}
          </div>

          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="p-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700/60 shadow-lg"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
