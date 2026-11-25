// All sound is synthesized with WebAudio — no audio files, no network.
// Short oscillator blips and filtered noise make pickup, chop, sizzle, ding
// and serve sounds; M mutes.
export function createSfx() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type = 'sine', vol = 0.12, slideTo = null) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  function noise(dur, vol = 0.08, freq = 1200) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = ac.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    pickup() { tone(520, 0.08, 'triangle', 0.1, 760); },
    place() { tone(340, 0.07, 'triangle', 0.09, 260); },
    chop() { noise(0.09, 0.14, 900); tone(180, 0.06, 'square', 0.05); },
    sizzle() { noise(0.5, 0.06, 2400); },
    ding() { tone(880, 0.25, 'sine', 0.11); tone(1320, 0.3, 'sine', 0.06); },
    serve() {
      tone(523, 0.12, 'triangle', 0.11);
      setTimeout(() => tone(659, 0.12, 'triangle', 0.11), 110);
      setTimeout(() => tone(784, 0.2, 'triangle', 0.12), 220);
    },
    fail() { tone(220, 0.18, 'sawtooth', 0.06, 140); },
    rush() { tone(392, 0.15, 'square', 0.08); setTimeout(() => tone(523, 0.2, 'square', 0.08), 150); },
    trash() { noise(0.15, 0.1, 500); },
  };
}

// A silent stand-in so the state rules can run headless (screenshots, tests)
// without touching audio at all.
export function silentSfx() {
  return {
    unlock() {}, toggleMute() { return true; }, muted: true,
    pickup() {}, place() {}, chop() {}, sizzle() {}, ding() {},
    serve() {}, fail() {}, rush() {}, trash() {},
  };
}
