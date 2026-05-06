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
