/* === FLIP SFX (Web Audio synth) === */

let audioCtx: AudioContext | undefined;

export function playFlipSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    const ctx = audioCtx;
    const t = ctx.currentTime;
    [0, 0.06].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(i === 0 ? 660 : 880, t + delay);
      gain.gain.setValueAtTime(0.0001, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.08, t + delay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.1);
    });
  } catch {
    // audio not available
  }
}

/* === MUSIC LOOP (HTMLAudioElement) === */

const MUTE_STORAGE_KEY = 'pokedex.musicMuted';

interface MusicState {
  audio: HTMLAudioElement | null;
  url: string | null;
  baseVolume: number;
  muted: boolean;
  listeners: Set<(muted: boolean) => void>;
}

function readMutedFromStorage(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persistMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? '1' : '0');
  } catch {
    // ignore (Safari private mode, etc.)
  }
}

const musicState: MusicState = {
  audio: null,
  url: null,
  baseVolume: 0.3,
  muted: readMutedFromStorage(),
  listeners: new Set(),
};

export function isMusicEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export interface PlayMusicOptions {
  volume?: number;
  loop?: boolean;
}

export function playMusic(url: string, opts: PlayMusicOptions = {}): void {
  if (!isMusicEnabled()) return;
  const { volume = 0.3, loop = true } = opts;
  musicState.baseVolume = volume;
  musicState.url = url;

  if (!musicState.audio) {
    const audio = new Audio(url);
    audio.loop = loop;
    audio.preload = 'auto';
    audio.volume = musicState.muted ? 0 : volume;
    musicState.audio = audio;
  } else {
    if (musicState.audio.src !== url) musicState.audio.src = url;
    musicState.audio.loop = loop;
    musicState.audio.volume = musicState.muted ? 0 : volume;
  }

  // Must run inside a user gesture handler with no awaits before this call
  // so the browser's autoplay policy permits playback.
  void musicState.audio.play().catch(() => {
    // play rejected; caller can retry after another gesture
  });
}

export function stopMusic(): void {
  if (!musicState.audio) return;
  musicState.audio.pause();
  musicState.audio.currentTime = 0;
}

export function isMusicMuted(): boolean {
  return musicState.muted;
}

export function setMusicMuted(muted: boolean): void {
  musicState.muted = muted;
  persistMuted(muted);
  if (musicState.audio) {
    musicState.audio.volume = muted ? 0 : musicState.baseVolume;
  }
  musicState.listeners.forEach((fn) => fn(muted));
}

export function toggleMusicMute(): boolean {
  setMusicMuted(!musicState.muted);
  return musicState.muted;
}

export function onMusicMuteChange(fn: (muted: boolean) => void): () => void {
  musicState.listeners.add(fn);
  return () => {
    musicState.listeners.delete(fn);
  };
}
