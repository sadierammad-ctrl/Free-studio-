// Web Audio Engine for real-time sound generation, pitch/EQ filtering, and multi-track mixing

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingMusic = false;
  private musicInterval: any = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private videoGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.destinationNode = this.ctx.createMediaStreamDestination();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.videoGain = this.ctx.createGain();
      this.filterNode = this.ctx.createBiquadFilter();

      this.filterNode.type = 'highpass';
      this.filterNode.frequency.value = 80; // default subtle high-pass to clear rumble

      // Connect graph
      this.musicGain.connect(this.masterGain);
      this.videoGain.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.destinationNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getExportStream(): MediaStream | null {
    this.init();
    return this.destinationNode ? this.destinationNode.stream : null;
  }

  public setVideoVolume(volumePercent: number, isMuted: boolean) {
    if (!this.videoGain) return;
    this.videoGain.gain.value = isMuted ? 0 : volumePercent / 100;
  }

  public setMusicVolume(volumePercent: number) {
    if (!this.musicGain) return;
    this.musicGain.gain.value = volumePercent / 100;
  }

  public setAudioFilter(enabled: boolean) {
    if (!this.filterNode || !this.ctx) return;
    if (enabled) {
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setValueAtTime(1400, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.2, this.ctx.currentTime);
    } else {
      this.filterNode.type = 'allpass';
    }
  }

  // Play synthesized royalty-free tracks
  public playTrack(trackId: string, volumePercent: number) {
    this.init();
    this.stopMusic();
    if (trackId === 'none' || !this.ctx || !this.musicGain) return;

    this.isPlayingMusic = true;
    this.setMusicVolume(volumePercent);

    if (trackId === 'lofi') {
      this.startLofiBeats();
    } else if (trackId === 'upbeat') {
      this.startUpbeatMelody();
    } else if (trackId === 'ambient') {
      this.startAmbientDrone();
    } else if (trackId === 'cinematic') {
      this.startCinematicPulse();
    }
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private startLofiBeats() {
    if (!this.ctx || !this.musicGain) return;
    const chords = [
      [261.63, 311.13, 392.00, 466.16], // Cm7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    let step = 0;

    const playStep = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;
      const chord = chords[step % chords.length];
      const now = this.ctx.currentTime;

      // Warm Electric Piano / Pad
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain!);
        osc.start(now);
        osc.stop(now + 1.85);
      });

      // Soft kick on beat 0, rim on beat 2
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.frequency.setValueAtTime(110, now);
      kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
      kickGain.gain.setValueAtTime(0.2, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.3);

      step++;
    };

    playStep();
    this.musicInterval = setInterval(playStep, 1800);
  }

  private startUpbeatMelody() {
    if (!this.ctx || !this.musicGain) return;
    const melody = [330, 392, 440, 523, 440, 392, 330, 294];
    let noteIdx = 0;

    const playNote = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const freq = melody[noteIdx % melody.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.4);

      noteIdx++;
    };

    playNote();
    this.musicInterval = setInterval(playNote, 400);
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.musicGain) return;
    const freqs = [130.81, 196.00, 261.63, 329.63];

    const playAmbientLayer = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);

        osc.connect(gain);
        gain.connect(this.musicGain!);
        osc.start(now);
        osc.stop(now + 5.2);
      });
    };

    playAmbientLayer();
    this.musicInterval = setInterval(playAmbientLayer, 4500);
  }

  private startCinematicPulse() {
    if (!this.ctx || !this.musicGain) return;
    const roots = [55, 65.41, 73.42, 49]; // A1, C2, D2, G1
    let pulse = 0;

    const playPulse = () => {
      if (!this.isPlayingMusic || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;
      const rootFreq = roots[Math.floor(pulse / 4) % roots.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(rootFreq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250 + (pulse % 4) * 80, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.7);

      pulse++;
    };

    playPulse();
    this.musicInterval = setInterval(playPulse, 700);
  }

  // Hook HTML5 Video element audio into our Web Audio graph
  public connectVideoElement(videoElement: HTMLMediaElement) {
    this.init();
    if (!this.ctx || !this.videoGain) return;
    try {
      // Create source node if not already connected
      if (!(videoElement as any)._audioSourceNode) {
        const sourceNode = this.ctx.createMediaElementSource(videoElement);
        sourceNode.connect(this.videoGain);
        (videoElement as any)._audioSourceNode = sourceNode;
      }
    } catch {
      // Element might already be hooked
    }
  }

  // Voiceover Microphone recorder
  public async toggleMicrophone(): Promise<boolean> {
    this.init();
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
      if (this.micSource) {
        this.micSource.disconnect();
        this.micSource = null;
      }
      return false;
    } else {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (this.ctx && this.masterGain) {
          this.micSource = this.ctx.createMediaStreamSource(this.micStream);
          const micGain = this.ctx.createGain();
          micGain.gain.value = 1.3; // Boost voiceover
          this.micSource.connect(micGain);
          micGain.connect(this.masterGain);
        }
        return true;
      } catch (err) {
        console.error('Microphone access denied:', err);
        return false;
      }
    }
  }
}

export const audioEngine = new AudioEngine();
