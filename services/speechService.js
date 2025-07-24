// SpeechService: Handles TTS with multi-speaker voice selection and playback control
export class SpeechService {
  constructor() {
    this.voices = [];
    this.voiceNeil = null;
    this.voiceKanishq = null;
    this.voiceNarrator = null;
    this.voiceSystem = null;
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.populateVoices();
    if (typeof this.synth.onvoiceschanged !== 'undefined') {
      this.synth.onvoiceschanged = () => this.populateVoices();
    }
  }
  populateVoices() {
    this.voices = this.synth.getVoices();
    const isMale = v => v.name && /dan|john|mike|paul|david|tom|neil|kanishq|alex|fred|george|james|peter|steve|matt|mark|richard|robert|sam|will|ben|chris|ed|ian|jack|joe|kevin|luke|nick|oliver|ryan|scott|tim|tony|adam|brian|charlie|daniel|eric|frank|greg|harry|jason|jeff|josh|justin|liam|logan|mason|nathan|noah|owen|patrick|ray|ron|sean|shawn|simon|stuart|todd|tyler|zac|zach/i.test(v.name);
    const isFemale = v => v.name && /amy|emma|olivia|ava|isabella|sophia|mia|charlotte|amelia|ella|abigail|emily|harper|lily|madison|chloe|grace|zoe|hannah|sarah|anna|jessica|ashley|elizabeth|melissa|nicole|rachel|samantha|stephanie|victoria|alexis|alyssa|brianna|kayla|lauren|megan|natasha|susan|tina|wendy|yvonne|zoey/i.test(v.name);
    const isGB = v => v.lang === 'en-GB';
    const isUS = v => v.lang === 'en-US';
    const isEnglish = v => v.lang && v.lang.startsWith('en');
    this.voiceKanishq = this.voices.find(v => isGB(v) && isMale(v)) ||
      this.voices.find(v => isEnglish(v) && !isUS(v) && isMale(v)) ||
      this.voices.find(v => isMale(v)) ||
      this.voices.find(v => isEnglish(v)) ||
      this.voices[0] || null;
    this.voiceNeil = this.voices.find(v => isUS(v) && isMale(v) && v !== this.voiceKanishq) ||
      this.voices.find(v => isMale(v) && v !== this.voiceKanishq) ||
      this.voiceKanishq;
    this.voiceNarrator = this.voices.find(v => isEnglish(v) && isFemale(v)) ||
      this.voices.find(v => v !== this.voiceNeil && v !== this.voiceKanishq) ||
      this.voiceKanishq;
    this.voiceSystem = this.voiceNeil;
  }
  speak(text, speaker = 'Narrator', onStart, onEnd, onError) {
    this.stop();
    const utter = new window.SpeechSynthesisUtterance(text);
    let selectedVoice = this.voiceNarrator;
    switch (speaker) {
      case 'Neil':
        selectedVoice = this.voiceNeil || this.voiceNarrator || (this.voices[0] || null);
        utter.pitch = 1.2;
        utter.rate = 1;
        break;
      case 'Kanishq':
        selectedVoice = this.voiceKanishq || this.voiceNarrator || (this.voices[0] || null);
        utter.pitch = 1.3;
        utter.rate = 1.05;
        break;
      case 'Narrator':
        selectedVoice = this.voiceNarrator || (this.voices[0] || null);
        utter.pitch = 1;
        utter.rate = 1;
        break;
      case 'System':
        selectedVoice = this.voiceSystem || this.voiceNarrator || (this.voices[0] || null);
        utter.pitch = 1.1;
        utter.rate = 0.95;
        break;
    }
    if (selectedVoice) utter.voice = selectedVoice;
    if (onStart) utter.onstart = onStart;
    if (onEnd) utter.onend = onEnd;
    if (onError) utter.onerror = onError;
    this.currentUtterance = utter;
    this.synth.speak(utter);
  }
  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }
  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }
  isSpeaking() {
    return this.synth.speaking;
  }
  isPaused() {
    return this.synth.paused;
  }
}
