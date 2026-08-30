'use client';

import React, { useState, useEffect } from 'react';
import { getCustomFirebaseConfig, setCustomFirebaseConfig } from '../../lib/roomEngine';
import { Cloud, Check, X, Globe, Sparkles, ExternalLink } from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const [dbUrl, setDbUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const config = getCustomFirebaseConfig();
    if (config?.databaseURL) {
      setDbUrl(config.databaseURL);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomFirebaseConfig({ databaseURL: dbUrl.trim() });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cross-Network Online Play</h2>
              <p className="text-xs text-neutral-400">Play with friends in different homes & 4G/5G</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-neutral-300 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">How it works:</strong> By default, players on the same Wi-Fi or same device can connect immediately. To play across different internet connections globally, enter any free <strong>Firebase Realtime Database URL</strong> below.
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2 border-t border-neutral-800">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">100% Free Setup (1 Minute):</strong> Create a free project at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a>, enable <em>Realtime Database</em>, and paste the URL.
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
              Firebase Realtime Database URL:
            </label>
            <input
              type="url"
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              placeholder="https://your-project-default-rtdb.firebaseio.com"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
              {isSaved ? 'Saved & Synced!' : 'Save Database URL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
