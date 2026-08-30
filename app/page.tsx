'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGameRoom } from '../lib/roomEngine';
import { GamePlayer } from '../lib/types';
import { PRESET_TASTE_PROFILES, generateSongsFromProfile } from '../lib/mockProfiles';
import { CloudSyncModal } from '../components/game/CloudSyncModal';
import { 
  Music, 
  Users, 
  Sparkles, 
  ArrowRight, 
  Play, 
  Zap, 
  Flame, 
  CheckCircle2, 
  Headphones, 
  Radio, 
  ShieldCheck, 
  Award,
  Globe
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(PRESET_TASTE_PROFILES[0].id);
  const [playerName, setPlayerName] = useState(PRESET_TASTE_PROFILES[0].name.split(' ')[0]);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  const activeProfile = PRESET_TASTE_PROFILES.find(p => p.id === selectedProfileId) || PRESET_TASTE_PROFILES[0];

  const handleProfileSelect = (profileId: string) => {
    const p = PRESET_TASTE_PROFILES.find(x => x.id === profileId);
    if (p) {
      setSelectedProfileId(profileId);
      setPlayerName(p.name.split(' ')[0]);
    }
  };

  const handleCreateRoom = () => {
    const playerId = `host_${Math.random().toString(36).substring(2, 9)}`;
    const topSongs = generateSongsFromProfile(activeProfile, playerId);

    const hostPlayer: GamePlayer = {
      id: playerId,
      name: playerName || activeProfile.name.split(' ')[0],
      avatar: activeProfile.avatar,
      isHost: true,
      isReady: true,
      spotifyConnected: true,
      spotifyUsername: `${activeProfile.genre} Taste`,
      topSongs: topSongs,
      score: 0,
      currentStreak: 0
    };

    localStorage.setItem('whose_track_active_player', JSON.stringify(hostPlayer));
    const room = createGameRoom(hostPlayer);
    router.push(`/room/${room.code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
    const topSongs = generateSongsFromProfile(activeProfile, playerId);

    const player: GamePlayer = {
      id: playerId,
      name: playerName || activeProfile.name.split(' ')[0],
      avatar: activeProfile.avatar,
      isHost: false,
      isReady: true,
      spotifyConnected: true,
      spotifyUsername: `${activeProfile.genre} Taste`,
      topSongs: topSongs,
      score: 0,
      currentStreak: 0
    };

    localStorage.setItem('whose_track_active_player', JSON.stringify(player));
    router.push(`/room/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-emerald-500 selection:text-black flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="py-4 px-6 sm:px-12 border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl text-black shadow-lg shadow-emerald-500/20">
              <Music className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white font-sans">
                ICEBREAKERS
              </span>
              <span className="ml-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">
                Spotify Party Game
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCloudModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition shadow-sm"
              title="Configure Online Play for different networks"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Online Setup</span>
            </button>
          </div>
        </div>
      </header>

      <CloudSyncModal isOpen={isCloudModalOpen} onClose={() => setIsCloudModalOpen(false)} />

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            The Ultimate Music Mystery Party Game
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Listen to the track. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Guess whose Top Song it is!
            </span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto">
            Connect your Spotify or pick a taste profile to load your Top 30 tracks. Compete with friends in real time, score speed points, and unlock 2x multipliers on shared hits!
          </p>
        </div>

        {/* Profile / Character Setup Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <Headphones className="w-4 h-4" />
            Step 1: Choose Your Music Identity & Top 30 Roster
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Your Player Name:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Music Taste Preset (30 Songs):
              </label>
              <select
                value={selectedProfileId}
                onChange={(e) => handleProfileSelect(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 transition"
              >
                {PRESET_TASTE_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.genre})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Profile Info Banner */}
          <div className="flex items-center gap-4 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
            <img
              src={activeProfile.avatar}
              alt={activeProfile.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/60 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">
                  {activeProfile.genre}
                </span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  30 Songs Loaded ✓
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                {activeProfile.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Grid: Create Room vs Join Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-8 shadow-2xl flex flex-col justify-between space-y-6 group transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Create a New Room
              </h2>
              <p className="text-neutral-400 text-sm">
                Get a unique 6-character room code. Invite friends to link their accounts and play together in real time!
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Host & Create Room
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-8 shadow-2xl flex flex-col justify-between space-y-6 group transition">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white">
                Join with Room Code
              </h2>
              <p className="text-neutral-400 text-sm">
                Have a friend's room code? Enter it below to jump straight into the guessing party!
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-CHAR CODE (e.g. PARTY8)"
                maxLength={8}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-2xl px-4 py-3 text-center text-white font-mono font-bold tracking-widest text-lg focus:outline-none focus:border-purple-500 transition"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition border border-neutral-700 active:scale-95"
              >
                Join Party
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              Speed-Based Scoring
            </div>
            <p className="text-xs text-neutral-400">
              The quicker you identify the suspect, the more points you earn (up to 1,000 pts per round).
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Flame className="w-4 h-4" />
              2X Shared Track Multiplier
            </div>
            <p className="text-xs text-neutral-400">
              If more than one person has the song in their Top 30, correct points are automatically doubled!
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              100% Guaranteed Audio
            </div>
            <p className="text-xs text-neutral-400">
              Powered by Apple iTunes 30-sec audio snippets fallback for instant zero-fail playback.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-neutral-800/60 text-center text-xs text-neutral-500">
        Icebreakers 🎵 • Real-Time Multiplayer Spotify Top-30 Guessing Party Game
      </footer>
    </div>
  );
}
