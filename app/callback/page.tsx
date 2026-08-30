'use client';

import React, { useEffect, useState } from 'react';
import { exchangeCodeForToken, fetchSpotifyUserProfile, fetchSpotifyTop30Tracks } from '../../lib/spotifyAuth';
import { updatePlayer, getRoom } from '../../lib/roomEngine';
import { GamePlayer } from '../../lib/types';
import { Loader2, Music, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SpotifyCallbackPage() {
  const [status, setStatus] = useState<string>('Connecting to Spotify...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const err = urlParams.get('error');

      if (err) {
        setError(`Spotify authorization was denied: ${err}`);
        return;
      }

      if (!code) {
        setError('No authorization code received from Spotify.');
        return;
      }

      try {
        setStatus('Exchanging authentication token...');
        const token = await exchangeCodeForToken(code);
        if (!token) {
          throw new Error('Failed to retrieve access token.');
        }

        setStatus('Fetching your Spotify profile...');
        const profile = await fetchSpotifyUserProfile(token);
        const playerId = profile?.id || `sp_user_${Date.now()}`;
        const playerName = profile?.display_name || 'Spotify Player';
        const playerAvatar = profile?.images?.[0]?.url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop';

        setStatus('Retrieving your Top 30 Spotify tracks and audio snippets...');
        const topSongs = await fetchSpotifyTop30Tracks(token, playerId);

        // Store active player in local storage
        const gamePlayer: GamePlayer = {
          id: playerId,
          name: playerName,
          avatar: playerAvatar,
          isHost: false,
          isReady: true,
          spotifyConnected: true,
          spotifyUsername: profile?.display_name || 'Spotify Connected',
          topSongs: topSongs,
          score: 0,
          currentStreak: 0
        };

        localStorage.setItem('whose_track_active_player', JSON.stringify(gamePlayer));

        setStatus('Connected! Redirecting back to game...');

        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        // If state was a room code, update player in that room and redirect
        if (state && state !== 'direct') {
          updatePlayer(state, playerId, gamePlayer);
          window.location.href = `${basePath}/room/${state}`;
        } else {
          window.location.href = `${basePath}/`;
        }
      } catch (e: any) {
        console.error('Spotify callback error:', e);
        setError(e.message || 'An unexpected error occurred during Spotify connection.');
      }
    }

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center mx-auto">
          {error ? (
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          ) : (
            <Music className="w-8 h-8 text-[#1DB954] animate-pulse" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">
            {error ? 'Connection Issue' : 'Spotify Sync'}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            {error ? error : status}
          </p>
        </div>

        {!error && (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Resolving 30-sec audio snippets for top tracks...</span>
          </div>
        )}

        {error && (
          <a
            href="/"
            className="inline-block px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm rounded-xl transition"
          >
            Return to Home
          </a>
        )}
      </div>
    </div>
  );
}
