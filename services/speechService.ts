// SpeechService: Handles TTS with multi-speaker voice selection and playback control
export type Speaker = 'Neil' | 'Kanishq' | 'Narrator' | 'System';

export class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private voiceNeil: SpeechSynthesisVoice | null = null;
  private voiceKanishq: SpeechSynthesisVoice | null = null;
  private voiceNarrator: SpeechSynthesisVoice | null = null;
  private voiceSystem: SpeechSynthesisVoice | null = null;
  private synth = window.speechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.populateVoices();
    if (typeof this.synth.onvoiceschanged !== 'undefined') {
      this.synth.onvoiceschanged = () => this.populateVoices();
    }
  }

  private populateVoices() {
    this.voices = this.synth.getVoices();
    // Gender/name heuristics for voice selection
    const isMale = (v: SpeechSynthesisVoice) => v.name && /dan|john|mike|paul|david|tom|neil|kanishq|alex|fred|george|james|peter|steve|matt|mark|richard|robert|sam|will|ben|chris|ed|ian|jack|joe|kevin|luke|nick|oliver|ryan|scott|tim|tony|adam|brian|charlie|daniel|eric|frank|greg|harry|jason|jeff|josh|justin|liam|logan|mason|nathan|noah|owen|patrick|ray|ron|sean|shawn|simon|stuart|todd|tyler|zac|zach/.test(v.name.toLowerCase());
    const isFemale = (v: SpeechSynthesisVoice) => v.name && /amy|emma|olivia|ava|isabella|sophia|mia|charlotte|amelia|ella|abigail|emily|harper|lily|madison|chloe|grace|zoe|hannah|sarah|anna|jessica|ashley|elizabeth|melissa|nicole|rachel|samantha|stephanie|victoria|alexis|alyssa|brianna|kayla|lauren|megan|natasha|susan|tina|wendy|yvonne|zoey/.test(v.name.toLowerCase());
    const isGB = (v: SpeechSynthesisVoice) => v.lang === 'en-GB';
    const isUS = (v: SpeechSynthesisVoice) => v.lang === 'en-US';
    const isEnglish = (v: SpeechSynthesisVoice) => v.lang && v.lang.startsWith('en');

    // Kanishq
    this.voiceKanishq = this.voices.find(v => isGB(v) && isMale(v)) ||
      this.voices.find(v => isEnglish(v) && !isUS(v) && isMale(v)) ||
      this.voices.find(v => isMale(v)) ||
      this.voices.find(v => isEnglish(v)) ||
      this.voices[0] || null;

    // Neil
    this.voiceNeil = this.voices.find(v => isUS(v) && isMale(v) && v !== this.voiceKanishq) ||
      this.voices.find(v => isMale(v) && v !== this.voiceKanishq) ||
      this.voiceKanishq;

    // Narrator
    this.voiceNarrator = this.voices.find(v => isEnglish(v) && isFemale(v)) ||
      this.voices.find(v => v !== this.voiceNeil && v !== this.voiceKanishq) ||
      this.voiceKanishq;

    // System
    this.voiceSystem = this.voiceNeil;
  }

  public speak(text: string, speaker: Speaker = 'Narrator', onStart?: () => void, onEnd?: () => void, onError?: (e: any) => void) {
    this.stop();
    const utter = new SpeechSynthesisUtterance(text);
    switch (speaker) {
      case 'Neil':
        utter.voice = this.voiceNeil;
        utter.pitch = 1.2;
        utter.rate = 1;
        break;
      case 'Kanishq':
        utter.voice = this.voiceKanishq;
        utter.pitch = 1.3;
        utter.rate = 1.05;
        break;
      case 'Narrator':
        utter.voice = this.voiceNarrator;
        utter.pitch = 1;
        utter.rate = 1;
        break;
      case 'System':
        utter.voice = this.voiceSystem;
        utter.pitch = 1.1;
        utter.rate = 0.95;
        break;
    }
    if (onStart) utter.onstart = onStart;
    if (onEnd) utter.onend = onEnd;
    if (onError) utter.onerror = onError;
    this.currentUtterance = utter;
    this.synth.speak(utter);
  }

  public pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  public isSpeaking() {
    return this.synth.speaking;
  }

  public isPaused() {
    return this.synth.paused;
  }
}
