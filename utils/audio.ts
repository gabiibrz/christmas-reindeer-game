// Audio controller handling both Synth SFX and HTML5 Background Music
class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Background Music (HTML5 Audio for actual songs)
  private musicAudio: HTMLAudioElement | null = null;
  // REPLACE THIS URL WITH YOUR "LAST CHRISTMAS" MP3 LINK
  // Currently pointing to a copyright-free holiday instrumental as placeholder
  private musicUrl: string = "https://cdn.pixabay.com/download/audio/2023/11/27/audio_651a5ec4b7.mp3?filename=christmas-background-music-178652.mp3"; 

  constructor() {
    // Init on first user interaction
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Low volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- SOUND EFFECTS (Synth) ---

  playJump() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playCollect() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    // Magical chime
    const now = this.ctx.currentTime;
    
    const createChime = (freq: number, delay: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + delay);
        osc.stop(now + delay + 0.6);
    };

    createChime(880, 0); // A5
    createChime(1108, 0.05); // C#6
    createChime(1318, 0.1); // E6
  }

  playPowerUp() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.5);
    
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain.gain);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.8);
  }

  playBad() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(now + 0.3);
  }

  playGameOver() {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      this.stopMusic();
      
      const createNote = (freq: number, start: number) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.4, start);
          gain.gain.exponentialRampToValueAtTime(0.01, start + 0.8);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(start);
          osc.stop(start + 0.8);
      };

      createNote(392, now); // G4
      createNote(370, now + 0.3); // F#4
      createNote(349, now + 0.6); // F4
      createNote(330, now + 0.9); // E4
  }

  // --- BACKGROUND MUSIC ---

  startMusic() {
    if (!this.musicAudio) {
        this.musicAudio = new Audio(this.musicUrl);
        this.musicAudio.loop = true;
        this.musicAudio.volume = 0.5;
    }
    
    // Resume audio context if suspended (browser policy)
    this.init();

    // Play if paused
    if (this.musicAudio.paused) {
        this.musicAudio.play().catch(e => console.log("Audio play failed (user interaction needed):", e));
    }
  }

  stopMusic() {
    if (this.musicAudio) {
        this.musicAudio.pause();
        this.musicAudio.currentTime = 0;
    }
  }
}

export const gameAudio = new AudioController();