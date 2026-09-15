/**
 * Web Audio API synthesizer for realistic paper page turning sounds.
 * Generates an authentic tactile rustle of aged parchment / paper without external audio files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playPageFlipSound(isFast: boolean = false) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Slow, weighted paper audio duration (~0.92s)
    const duration = isFast ? 0.42 : 0.92;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Create organic noise resembling dry aged paper friction and fiber flex
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Dual-pole pink noise with granular paper texture
      data[i] = (lastOut + 0.025 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.8;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter sweeping through realistic paper scrape frequencies
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(isFast ? 1400 : 1100, ctx.currentTime);
    // Slow descent of acoustic resonance as leaf ascends and arches
    bandpass.frequency.exponentialRampToValueAtTime(isFast ? 550 : 320, ctx.currentTime + duration);
    bandpass.Q.setValueAtTime(1.9, ctx.currentTime);

    // Highpass to eliminate artificial low rumble
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(260, ctx.currentTime);

    // Dynamic volume envelope:
    // 0 to 0.18s: Tactile finger lift & corner separation
    // 0.18 to 0.65s: Slow, soothing air friction across the parchment plane
    // 0.65 to 0.92s: Soft settling flutter and landing
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.0001, now);
    // Corner peel lift
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.12);
    // Slow sweeping flight
    gainNode.gain.linearRampToValueAtTime(0.16, now + (duration * 0.48));
    // Soft landing pat
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Connect audio graph
    noiseSource.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + duration);
  } catch (err) {
    console.debug('Audio play failed or not allowed yet by user gesture', err);
  }
}

let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;
let isAmbientPlaying = false;

export function isAmbiancePlaying(): boolean {
  return isAmbientPlaying;
}

export function toggleAmbiance(onPlayingChange?: (isPlaying: boolean) => void): boolean {
  if (isAmbientPlaying) {
    stopAmbiance();
    onPlayingChange?.(false);
    return false;
  } else {
    startAmbiance();
    onPlayingChange?.(true);
    return true;
  }
}

export function startAmbiance() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isAmbientPlaying) return;

    // Create 4-second looping buffer of gentle crackling & warm room tone
    const sampleRate = ctx.sampleRate;
    const duration = 4.0;
    const bufferSize = sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise base
      lastOut = (lastOut + 0.03 * white) / 1.03;
      data[i] = lastOut * 0.35;

      // Occasional random gentle fireplace/candle pop crackle
      if (Math.random() < 0.0018) {
        data[i] += (Math.random() - 0.5) * 0.45;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Warm Lowpass filter (subtle soothing warmth)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(650, ctx.currentTime);

    // Highpass to clean sub-bass
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(120, ctx.currentTime);

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    // Smooth fade in over 1.2 seconds
    gain.gain.linearRampToValueAtTime(0.12, now + 1.2);

    source.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(ctx.destination);

    source.start(now);

    ambientSource = source;
    ambientGain = gain;
    isAmbientPlaying = true;
  } catch (e) {
    console.debug('Failed to start ambiance:', e);
  }
}

export function stopAmbiance() {
  try {
    if (ambientGain && audioCtx) {
      const now = audioCtx.currentTime;
      ambientGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
      setTimeout(() => {
        try {
          ambientSource?.stop();
          ambientSource?.disconnect();
          ambientSource = null;
          ambientGain = null;
        } catch {
          // ignore
        }
      }, 700);
    } else {
      ambientSource?.stop();
      ambientSource?.disconnect();
      ambientSource = null;
      ambientGain = null;
    }
    isAmbientPlaying = false;
  } catch (e) {
    console.debug('Failed to stop ambiance:', e);
  }
}

/**
 * Synthesizes a crisp tactile click of an antique brass rotary toggle switch
 */
export function playLampSwitchSound(turningOn: boolean = true) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Short mechanical transient click
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(turningOn ? 1280 : 960, now);
    osc.frequency.exponentialRampToValueAtTime(turningOn ? 420 : 310, now + 0.025);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(turningOn ? 1800 : 1350, now);
    filter.Q.setValueAtTime(3.2, now);

    oscGain.gain.setValueAtTime(0.24, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    // Mechanical friction burst (spring snap)
    const bufferSize = Math.floor(ctx.sampleRate * 0.02);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
    noiseSource.start(now);
    noiseSource.stop(now + 0.025);
  } catch (err) {
    console.debug('Lamp switch sound failed:', err);
  }
}

