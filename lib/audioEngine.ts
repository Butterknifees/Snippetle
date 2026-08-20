export class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private timer: number | null = null;
  private isPlaying: boolean = false;
  private onPlayStateChange?: (playing: boolean, currentTime: number) => void;
  private animFrameReq: number | null = null;

  constructor(onPlayStateChange?: (playing: boolean, currentTime: number) => void) {
    this.onPlayStateChange = onPlayStateChange;
  }

  public loadSong(url: string) {
    this.stop();
    if (typeof window !== 'undefined') {
      this.audio = new Audio(url);
      this.audio.preload = "auto";
      this.audio.addEventListener('ended', () => this.handleEnd());
      this.audio.addEventListener('pause', () => this.handleEnd());
    }
  }

  public playSnippet(duration: number, startTime: number = 0) {
    if (!this.audio) return;

    this.stop();
    this.audio.currentTime = startTime;
    
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.isPlaying = true;
        this.startProgressLoop(duration, startTime);

        // Schedule precise pause at startTime + duration
        const ms = duration * 1000;
        this.timer = window.setTimeout(() => {
          this.pause();
        }, ms);
      }).catch(err => {
        console.warn("Audio play blocked or failed:", err);
      });
    }
  }

  public playFull() {
    if (!this.audio) return;
    this.stop();
    this.audio.currentTime = 0;
    this.audio.play();
    this.isPlaying = true;
    this.startProgressLoop(this.audio.duration || 30, 0);
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.handleEnd();
  }

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.animFrameReq) {
      cancelAnimationFrame(this.animFrameReq);
      this.animFrameReq = null;
    }
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false, 0);
    }
  }

  private handleEnd() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.animFrameReq) {
      cancelAnimationFrame(this.animFrameReq);
      this.animFrameReq = null;
    }
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false, this.audio ? this.audio.currentTime : 0);
    }
  }

  private startProgressLoop(targetDuration: number, startTime: number) {
    const update = () => {
      if (!this.isPlaying || !this.audio) return;
      const current = this.audio.currentTime - startTime;
      if (this.onPlayStateChange) {
        this.onPlayStateChange(true, Math.max(0, current));
      }
      if (current < targetDuration && this.isPlaying) {
        this.animFrameReq = requestAnimationFrame(update);
      }
    };
    this.animFrameReq = requestAnimationFrame(update);
  }

  public setVolume(vol: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, vol));
    }
  }
}
