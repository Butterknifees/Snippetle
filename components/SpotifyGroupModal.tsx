'use client';

import React, { useState } from 'react';
import { X, Users, Music, Link as LinkIcon, Plus, CheckCircle2, Sparkles, UserPlus } from 'lucide-react';
import { GroupRoom, SpotifyUser } from '../lib/types';
import { addMockUserToRoom, createRoom } from '../lib/roomStore';
import { MOCK_SPOTIFY_USERS, getSpotifyAuthUrl } from '../lib/spotify';

interface SpotifyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GroupRoom | null;
  setRoom: (r: GroupRoom) => void;
  onStartGroupGame: () => void;
}

export const SpotifyGroupModal: React.FC<SpotifyGroupModalProps> = ({
  isOpen,
  onClose,
  room,
  setRoom,
  onStartGroupGame
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreateNewRoom = () => {
    const host = MOCK_SPOTIFY_USERS[0];
    const newRoom = createRoom(host);
    setRoom(newRoom);
  };

  const handleAddFriend = () => {
    if (!room) {
      handleCreateNewRoom();
      return;
    }
    const updated = addMockUserToRoom(room);
    setRoom(updated);
  };

  const handleCopyLink = () => {
    if (!room) return;
    const url = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeRoom = room || createRoom(MOCK_SPOTIFY_USERS[0]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-songless-dark border border-songless-tile w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-songless-subtext hover:text-white bg-songless-tile rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-songless-spotify/20 text-songless-spotify rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-songless-text flex items-center space-x-2">
              <span>Spotify Listening History Mode</span>
            </h2>
            <p className="text-xs text-songless-subtext">
              Pool listening histories from up to 5 friends to generate a custom game!
            </p>
          </div>
        </div>

        {/* Room Code Share Bar */}
        <div className="bg-songless-tile/60 p-4 rounded-2xl border border-songless-tile flex items-center justify-between">
          <div>
            <div className="text-[10px] text-songless-subtext uppercase font-mono tracking-widest">
              Group Room Code
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono tracking-wider">
              {activeRoom.code}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-songless-tile hover:bg-songless-tileHover text-xs font-bold text-white rounded-xl flex items-center space-x-1.5 transition"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>

        {/* Users List (Up to 5) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-songless-subtext">
            <span>CONNECTED SPOTIFY ACCOUNTS ({activeRoom.users.length}/5)</span>
            <span className="text-songless-spotify">{activeRoom.playlist.length} Hindi Songs Pooled</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {activeRoom.users.map((user, idx) => (
              <div
                key={user.id}
                className="bg-songless-tile p-3 rounded-2xl flex items-center justify-between border border-songless-tileHover"
              >
                <div className="flex items-center space-x-3">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-songless-spotify"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-songless-spotify text-black font-bold flex items-center justify-center">
                      {user.displayName[0]}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-songless-text flex items-center space-x-2">
                      <span>{user.displayName}</span>
                      {idx === 0 && (
                        <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-songless-subtext flex items-center space-x-1">
                      <Music className="w-3 h-3 text-songless-spotify" />
                      <span>{user.topTracks.length} top Hindi tracks added</span>
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-songless-spotify" />
              </div>
            ))}

            {/* Slot Placeholders */}
            {Array.from({ length: 5 - activeRoom.users.length }).map((_, i) => (
              <div
                key={i}
                className="border-2 border-dashed border-songless-tileHover p-3 rounded-2xl flex items-center justify-center text-xs text-songless-subtext"
              >
                <span>Slot #{activeRoom.users.length + i + 1} - Waiting for friend to join</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {activeRoom.users.length < 5 && (
            <button
              onClick={handleAddFriend}
              className="w-full py-3 bg-songless-tile hover:bg-songless-tileHover text-songless-text rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition border border-songless-tileHover"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Simulate Adding Friend Spotify Account ({activeRoom.users.length}/5)</span>
            </button>
          )}

          <button
            onClick={() => {
              onStartGroupGame();
              onClose();
            }}
            className="w-full py-4 bg-gradient-to-r from-songless-spotify to-emerald-400 hover:from-emerald-400 hover:to-songless-spotify text-black font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center space-x-2 transform hover:scale-[1.01] active:scale-[0.99] transition"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>START GROUP GAME WITH {activeRoom.playlist.length} SONGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
