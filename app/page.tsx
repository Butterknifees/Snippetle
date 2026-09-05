'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { AudioPlayerControls } from '../components/AudioPlayerControls';
import { GuessTimeline } from '../components/GuessTimeline';
import { SongSearchInput } from '../components/SongSearchInput';
import { SpotifyGroupModal } from '../components/SpotifyGroupModal';
import { GameResultModal } from '../components/GameResultModal';
import { StatsModal } from '../components/StatsModal';
import { Song, GuessAttempt, GUESS_DURATIONS, GroupRoom, SongCategory, HindiGenre, AttemptStatus, getISTDateString } from '../lib/types';
import { getDailyThreeSongs, getSongsByCategoryAndGenre } from '../lib/hindiSongs';
import { AudioEngine } from '../lib/audioEngine';
import { getSavedRoom, createRoom } from '../lib/roomStore';
import { MOCK_SPOTIFY_USERS } from '../lib/spotify';
import { Users, Clock } from 'lucide-react';

function checkArtistOverlap(artist1: string, artist2: string): boolean {
  const a1List = artist1.toLowerCase().split(/[,&]/).map(s => s.trim()).filter(Boolean);
  const a2List = artist2.toLowerCase().split(/[,&]/).map(s => s.trim()).filter(Boolean);
  return a1List.some(a1 => a2List.some(a2 => a1.includes(a2) || a2.includes(a1)));
}

export default function Home() {
  const [category, setCategory] = useState<SongCategory>('HINDI');
  const [hindiGenre, setHindiGenre] = useState<HindiGenre>('POP');
  const [mode, setMode] = useState<'DAILY' | 'GROUP'>('DAILY');
  
  // Daily 3-Song Progress State
  const [dailyThreeSongs, setDailyThreeSongs] = useState<Song[]>([]);
  const [dailySongIndex, setDailySongIndex] = useState<number>(0);
  const [completedDailySongIds, setCompletedDailySongIds] = useState<string[]>([]);
  const [isDailyCompleted, setIsDailyCompleted] = useState<boolean>(false);

  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [attempts, setAttempts] = useState<GuessAttempt[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);

  // Modals & Audio state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<GroupRoom | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayingFull, setIsPlayingFull] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Countdown timer to IST midnight
  const [istCountdown, setIstCountdown] = useState<string>('');

  // Stats
  const [stats, setStats] = useState({
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0]
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);

  // IST Midnight Countdown Effect
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const utcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      const istNow = new Date(utcMs + (5.5 * 60 * 60 * 1000));
      const istTomorrow = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate() + 1, 0, 0, 0);
      const diffMs = istTomorrow.getTime() - istNow.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setIstCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Audio Engine & Room
  useEffect(() => {
    const engine = new AudioEngine((playing, currentTime) => {
      setIsPlaying(playing);
      const curDur = GUESS_DURATIONS[Math.min(currentStep, 5)];
      setPlaybackProgress(Math.min(1, currentTime / curDur));
    });
    audioEngineRef.current = engine;

    const savedRoom = getSavedRoom();
    if (savedRoom) {
      setRoom(savedRoom);
    } else {
      setRoom(createRoom(MOCK_SPOTIFY_USERS[0]));
    }

    const savedStats = localStorage.getItem('snippetle_stats');
    if (savedStats) {
      try { setStats(JSON.parse(savedStats)); } catch (e) {}
    }
  }, []);

  // Update Daily 3 Songs when category or genre changes (IST Midnight Seed)
  useEffect(() => {
    const istDate = getISTDateString();
    const threeSongs = getDailyThreeSongs(category, hindiGenre, istDate);
    setDailyThreeSongs(threeSongs);

    const key = `snippetle_progress_${category}_${category === 'HINDI' ? hindiGenre : 'ALL'}_${istDate}`;
    const storedProgress = localStorage.getItem(key);

    if (storedProgress) {
      try {
        const parsed = JSON.parse(storedProgress);
        const ids = parsed.completedSongIds || [];
        setCompletedDailySongIds(ids);
        const doneCount = ids.length;
        if (doneCount >= 3) {
          setIsDailyCompleted(true);
          setDailySongIndex(2);
          setActiveSong(threeSongs[2]);
        } else {
          setIsDailyCompleted(false);
          setDailySongIndex(doneCount);
          setActiveSong(threeSongs[doneCount]);
        }
      } catch (e) {
        setDailySongIndex(0);
        setActiveSong(threeSongs[0]);
      }
    } else {
      setIsDailyCompleted(false);
      setCompletedDailySongIds([]);
      setDailySongIndex(0);
      setActiveSong(threeSongs[0]);
    }

    resetGameState();
  }, [category, hindiGenre]);

  // Load Active Song Audio
  useEffect(() => {
    if (audioEngineRef.current && activeSong) {
      audioEngineRef.current.loadSong(activeSong.audioUrl);
    }
  }, [activeSong]);

  const handlePlaySnippet = () => {
    if (!audioEngineRef.current || isGameOver) return;
    const duration = GUESS_DURATIONS[Math.min(currentStep, 5)];
    audioEngineRef.current.playSnippet(duration);
  };

  const handlePause = () => {
    if (audioEngineRef.current) audioEngineRef.current.pause();
  };

  const handleSkipStep = () => {
    if (isGameOver) return;
    const newAttempt: GuessAttempt = { status: 'SKIPPED' };
    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      endGame(false, updatedAttempts);
    }
  };

  const handleGuessSong = (selectedSong: Song) => {
    if (isGameOver || !activeSong) return;

    const isExactTitle = selectedSong.id === activeSong.id || 
      selectedSong.title.toLowerCase().trim() === activeSong.title.toLowerCase().trim();

    let status: AttemptStatus = 'INCORRECT';

    if (isExactTitle) {
      status = 'CORRECT';
    } else if (checkArtistOverlap(selectedSong.artist, activeSong.artist)) {
      status = 'ARTIST_CORRECT'; // Yellow status for correct artist!
    }

    const newAttempt: GuessAttempt = {
      guess: `${selectedSong.title} - ${selectedSong.artist}`,
      status,
      song: selectedSong
    };

    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);

    if (status === 'CORRECT') {
      endGame(true, updatedAttempts);
    } else if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      endGame(false, updatedAttempts);
    }
  };

  const endGame = (won: boolean, finalAttempts: GuessAttempt[]) => {
    setIsGameOver(true);
    setIsWon(won);
    setIsResultModalOpen(true);

    if (audioEngineRef.current) {
      audioEngineRef.current.playFull();
      setIsPlayingFull(true);
    }

    if (mode === 'DAILY' && activeSong) {
      const istDate = getISTDateString();
      const key = `snippetle_progress_${category}_${category === 'HINDI' ? hindiGenre : 'ALL'}_${istDate}`;
      
      setCompletedDailySongIds(prev => {
        const newCompleted = [...prev, activeSong.id];
        const isFinished = newCompleted.length >= 3;
        if (isFinished) {
          setIsDailyCompleted(true);
        }
        localStorage.setItem(key, JSON.stringify({
          date: istDate,
          category,
          genre: category === 'HINDI' ? hindiGenre : 'ALL',
          completedSongIds: newCompleted,
          isFinished
        }));
        return newCompleted;
      });
    }

    // Save Stats
    setStats(prev => {
      const newStats = { ...prev };
      newStats.played += 1;
      if (won) {
        newStats.wins += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        const stepIdx = Math.min(finalAttempts.length - 1, 5);
        newStats.guessDistribution[stepIdx] += 1;
      } else {
        newStats.currentStreak = 0;
      }
      localStorage.setItem('snippetle_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const handleNextSong = () => {
    if (mode === 'DAILY') {
      const nextIdx = dailySongIndex + 1;
      if (nextIdx < 3 && dailyThreeSongs[nextIdx]) {
        setDailySongIndex(nextIdx);
        setActiveSong(dailyThreeSongs[nextIdx]);
      } else {
        setIsDailyCompleted(true);
      }
    } else if (mode === 'GROUP' && room && room.playlist.length > 0) {
      const nextIdx = Math.floor(Math.random() * room.playlist.length);
      setActiveSong(room.playlist[nextIdx]);
    } else {
      const pool = getSongsByCategoryAndGenre(category, hindiGenre);
      const randomIdx = Math.floor(Math.random() * pool.length);
      setActiveSong(pool[randomIdx]);
    }
    resetGameState();
  };

  const resetGameState = () => {
    setCurrentStep(0);
    setAttempts([]);
    setIsGameOver(false);
    setIsWon(false);
    setIsPlayingFull(false);
    setPlaybackProgress(0);
    if (audioEngineRef.current) audioEngineRef.current.stop();
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioEngineRef.current) audioEngineRef.current.setVolume(nextMute ? 0 : 1);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-songless-bg text-songless-text selection:bg-amber-400 selection:text-black">
      {/* Top Header */}
      <Navbar
        category={category}
        setCategory={setCategory}
        hindiGenre={hindiGenre}
        setHindiGenre={setHindiGenre}
        mode={mode}
        setMode={setMode}
        openGroupModal={() => setIsGroupModalOpen(true)}
        openStatsModal={() => setIsStatsModalOpen(true)}
        isMuted={isMuted}
        toggleMute={toggleMute}
        dailyProgressCount={completedDailySongIds.length}
      />

      {/* Main Game Interface */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col justify-center space-y-6">
        
        {/* Banner for Daily Mode vs Group Mode */}
        {mode === 'DAILY' && (
          <div className="bg-songless-tile/40 backdrop-blur border border-songless-tile p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-amber-400 uppercase tracking-wider">
                Daily 3-Song Challenge ({category === 'HINDI' ? `Hindi ${hindiGenre}` : 'English'})
              </span>
              <span className="text-songless-subtext">•</span>
              <span className="text-songless-subtext font-mono font-bold">
                Song {Math.min(dailySongIndex + 1, 3)} of 3
              </span>
            </div>

            <div className="text-[11px] font-mono text-songless-subtext flex items-center space-x-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Reset: {istCountdown}</span>
            </div>
          </div>
        )}

        {mode === 'GROUP' && room && (
          <div className="bg-gradient-to-r from-songless-spotify/20 to-emerald-500/10 border border-songless-spotify/40 p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-songless-spotify text-black rounded-xl font-black text-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-songless-text flex items-center space-x-2">
                  <span>Spotify Group Room: <span className="text-amber-400 font-mono font-black">{room.code}</span></span>
                </div>
                <div className="text-[11px] text-songless-subtext">
                  Playing pooled songs from {room.users.length} connected friends!
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsGroupModalOpen(true)}
              className="px-3 py-1.5 bg-songless-tile hover:bg-songless-tileHover text-xs font-bold rounded-xl border border-songless-tileHover"
            >
              Manage Room
            </button>
          </div>
        )}

        {/* Daily Completed Locked Card */}
        {mode === 'DAILY' && isDailyCompleted ? (
          <div className="bg-songless-tile/60 backdrop-blur border border-amber-400/40 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-400/30">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Daily Challenge Complete!</h2>
              <p className="text-xs text-songless-subtext">
                You have played all 3 daily songs for today's {category === 'HINDI' ? `Hindi ${hindiGenre}` : 'English'} category.
              </p>
            </div>

            <div className="bg-amber-400/10 p-4 rounded-2xl border border-amber-400/20 inline-block">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Next 3 Songs Unlock In (IST Midnight)
              </div>
              <div className="text-3xl font-black font-mono text-white tracking-widest pt-1">
                {istCountdown}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Guess Attempts Timeline */}
            <GuessTimeline attempts={attempts} currentStep={currentStep} />

            {/* Audio Snippet Controls */}
            <AudioPlayerControls
              currentStep={currentStep}
              isPlaying={isPlaying}
              onPlay={handlePlaySnippet}
              onPause={handlePause}
              onSkip={handleSkipStep}
              playbackProgress={playbackProgress}
              isGameOver={isGameOver}
              activeSong={activeSong || undefined}
            />

            {/* Autocomplete Search */}
            <SongSearchInput
              onSelectSong={handleGuessSong}
              isGameOver={isGameOver}
              category={category}
              poolSongs={mode === 'GROUP' && room ? room.playlist : undefined}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-songless-subtext border-t border-songless-tile/40">
        <span>Snippetle 🎵 • Daily 3-Song Challenge & Spotify Group History</span>
      </footer>

      {/* Modals */}
      <SpotifyGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        room={room}
        setRoom={setRoom}
        onStartGroupGame={() => {
          setMode('GROUP');
          handleNextSong();
        }}
      />

      {activeSong && (
        <GameResultModal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          targetSong={activeSong}
          isWon={isWon}
          attempts={attempts}
          onPlayFullSong={() => audioEngineRef.current?.playFull()}
          onPauseFullSong={() => audioEngineRef.current?.pause()}
          isPlayingFull={isPlayingFull}
          onNextSong={handleNextSong}
          dailySongIndex={dailySongIndex}
          isDailyCompleted={isDailyCompleted}
          category={category}
          hindiGenre={hindiGenre}
        />
      )}

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
      />
    </div>
  );
}
