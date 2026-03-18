function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

type Note = [number, number, OscillatorType?];

function seq(notes: Note[], delay = 0) {
  notes.forEach(([freq, dur, d], i) =>
    setTimeout(() => playTone(freq, dur, d ?? "sine"), delay + i * 80)
  );
}

export const sounds = {
  feed: () => seq([[523, 0.12], [659, 0.15]]),
  play: () => seq([[659, 0.1], [784, 0.1], [1047, 0.18]]),
  clean: () => seq([[784, 0.15, "triangle"], [880, 0.15, "triangle"]]),
  pet: () => seq([[523, 0.1], [587, 0.1], [659, 0.1], [784, 0.15]]),
  sleep: () => playTone(330, 0.4, "triangle", 0.05),
  achievement: () => seq([[523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.25]], 0),
  collect: () => playTone(880, 0.07, "sine", 0.06),
  miss: () => playTone(180, 0.25, "sawtooth", 0.05),
  coins: () => seq([[1047, 0.08], [1319, 0.12]]),
};
