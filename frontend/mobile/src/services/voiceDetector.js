import { Platform } from 'react-native';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

let ExpoSpeechRecognition = ExpoSpeechRecognitionModule || null;
if (!ExpoSpeechRecognition) {
  try {
    const mod = require('expo-speech-recognition');
    ExpoSpeechRecognition = mod.ExpoSpeechRecognitionModule || mod.default?.ExpoSpeechRecognitionModule || mod;
  } catch (e) {
    // Graceful fallback if native module is not linked in current binary
  }
}

class VoiceDetector {
  constructor() {
    this.isListening = false;
    this.triggerPhrase = 'safeher sos';
    this.alternatePhrases = ['help safeher', 'safeher emergency', 'sos safeher'];
    this.onTriggerCallback = null;
    this.onStatusChangeCallback = null;
    this.lastTriggerTime = 0;
    this.COOLDOWN_MS = 4000;
    this.subscriptions = [];
    this.restartTimeout = null;
  }

  isSupported = () => {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }
    return !!ExpoSpeechRecognition;
  };

  /**
   * Boolean-returning permission helper for SettingsScreen and UI components
   */
  requestPermissions = async () => {
    const res = await this.requestPermissionsAsync();
    return res && res.granted === true;
  };

  /**
   * Object-returning permission helper compatible with Expo permissions standard
   */
  requestPermissionsAsync = async () => {
    try {
      if (Platform.OS === 'web') {
        return { granted: true };
      }
      console.log('[VoiceDetector] requestPermissionsAsync invoked. Module:', !!ExpoSpeechRecognition);
      if (ExpoSpeechRecognition?.requestPermissionsAsync) {
        const res = await ExpoSpeechRecognition.requestPermissionsAsync();
        const granted = res?.status === 'granted' || res?.granted === true;
        console.log('[VoiceDetector] Native permission result:', res);
        return { granted, status: res?.status || (granted ? 'granted' : 'denied') };
      }
      return { granted: false, status: 'unavailable' };
    } catch (e) {
      console.warn('[VoiceDetector] Permission check failed:', e.message);
      return { granted: false, error: e.message, status: 'error' };
    }
  };

  startListening = async (onTrigger, onStatusChange) => {
    console.log('[VoiceDetector] startListening called. isListening:', this.isListening, 'hasNativeModule:', !!ExpoSpeechRecognition);
    if (this.isListening) {
      this.stopListening();
    }

    this.onTriggerCallback = onTrigger;
    this.onStatusChangeCallback = onStatusChange;

    const perm = await this.requestPermissionsAsync();
    console.log('[VoiceDetector] Permission check inside startListening:', perm);
    if (!perm.granted) {
      this._updateStatus(false, 'Microphone permission denied');
      return false;
    }

    this.isListening = true;
    this._updateStatus(true, 'Listening for trigger phrase ("SafeHer SOS")...');

    try {
      if (Platform.OS !== 'web' && ExpoSpeechRecognition) {
        // Clear previous subscriptions
        this._clearSubscriptions();

        // Register official expo-speech-recognition listeners
        if (typeof ExpoSpeechRecognition.addListener === 'function') {
          console.log('[VoiceDetector] Attaching ExpoSpeechRecognition listeners');
          // 1. Result event: receives ExpoSpeechRecognitionResultEvent ({ results, isFinal })
          const subResult = ExpoSpeechRecognition.addListener('result', (event) => {
            const results = (event?.results || []).map(r => r.transcript);
            console.log('[VoiceDetector] Received speech transcripts:', results);
            this._processTranscripts(results);
          });
          this.subscriptions.push(subResult);

          // 2. Nomatch event: audio finished without matching transcript -> restart
          const subNoMatch = ExpoSpeechRecognition.addListener('nomatch', () => {
            console.log('[VoiceDetector] Speech nomatch event');
            if (this.isListening) {
              this._scheduleRestart();
            }
          });
          this.subscriptions.push(subNoMatch);

          // 3. Error event: handles recognizer errors cleanly without crashing
          const subError = ExpoSpeechRecognition.addListener('error', (event) => {
            const errCode = event?.error || 'unknown';
            console.log('[VoiceDetector] Native speech error:', errCode, event?.message);

            // If continuous listening is enabled and error is non-fatal, restart
            if (this.isListening && errCode !== 'aborted') {
              this._scheduleRestart();
            }
          });
          this.subscriptions.push(subError);

          // 4. End event: Android speech recognizer stops after silence; restart if still listening
          const subEnd = ExpoSpeechRecognition.addListener('end', () => {
            console.log('[VoiceDetector] Native speech end event');
            if (this.isListening) {
              this._scheduleRestart();
            }
          });
          this.subscriptions.push(subEnd);
        }

        // Start native recognition
        if (typeof ExpoSpeechRecognition.start === 'function') {
          this._startNativeRecognizer();
        }
      } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          this.webRecognizer = new SpeechRecognition();
          this.webRecognizer.continuous = true;
          this.webRecognizer.interimResults = true;
          this.webRecognizer.lang = 'en-US';

          this.webRecognizer.onresult = (event) => {
            const results = [];
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              results.push(event.results[i][0].transcript);
            }
            this._processTranscripts(results);
          };

          this.webRecognizer.onerror = (err) => {
            console.warn('[VoiceDetector] Web Speech error:', err.error);
          };

          this.webRecognizer.onend = () => {
            if (this.isListening) {
              try {
                this.webRecognizer.start();
              } catch (e) {}
            }
          };

          this.webRecognizer.start();
        }
      }
      return true;
    } catch (e) {
      console.warn('[VoiceDetector] Failed to start voice recognition:', e.message);
      this._updateStatus(false, `Speech recognition unavailable: ${e.message}`);
      this.isListening = false;
      return false;
    }
  };

  stopListening = () => {
    this.isListening = false;
    this._updateStatus(false, 'Voice trigger inactive');

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    try {
      if (ExpoSpeechRecognition?.stop) {
        ExpoSpeechRecognition.stop();
      }
      this._clearSubscriptions();

      if (this.webRecognizer) {
        this.webRecognizer.stop();
        this.webRecognizer = null;
      }
    } catch (e) {
      console.warn('[VoiceDetector] Error stopping recognizer:', e.message);
    }
  };

  _clearSubscriptions = () => {
    for (const sub of this.subscriptions) {
      try {
        if (sub && typeof sub.remove === 'function') {
          sub.remove();
        }
      } catch (e) {}
    }
    this.subscriptions = [];
  };

  _startNativeRecognizer = () => {
    if (!this.isListening || !ExpoSpeechRecognition?.start) return;
    try {
      console.log('[VoiceDetector] Starting native recognizer (lang: en-IN, continuous: false)');
      ExpoSpeechRecognition.start({
        lang: 'en-IN',
        interimResults: true,
        continuous: false,
        contextualStrings: [
          'SafeHer', 'SafeHer SOS', 'Safe Her', 'Safe Her SOS',
          'SOS', 'SaveHer', 'Save Her', 'Save Her SOS',
          'Help', 'Help SafeHer', 'Emergency'
        ],
      });
    } catch (err) {
      console.warn('[VoiceDetector] Failed to call start:', err.message);
    }
  };

  _scheduleRestart = (delay = 300) => {
    if (!this.isListening) return;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    this.restartTimeout = setTimeout(async () => {
      if (!this.isListening || !ExpoSpeechRecognition?.start) return;
      try {
        const state = ExpoSpeechRecognition.getStateAsync ? await ExpoSpeechRecognition.getStateAsync() : 'inactive';
        if (state !== 'inactive' && ExpoSpeechRecognition.abort) {
          try { ExpoSpeechRecognition.abort(); } catch (e) {}
          await new Promise(r => setTimeout(r, 80));
        }
        this._startNativeRecognizer();
      } catch (e) {
        console.log('[VoiceDetector] Restart retry error:', e.message);
        if (this.isListening) {
          setTimeout(() => {
            if (this.isListening) {
              this._startNativeRecognizer();
            }
          }, 400);
        }
      }
    }, delay);
  };

  _processTranscripts = (transcripts) => {
    if (!this.isListening || !this.onTriggerCallback) return;

    const now = Date.now();
    if (now - this.lastTriggerTime < this.COOLDOWN_MS) {
      return;
    }

    for (const text of transcripts) {
      if (!text) continue;
      const raw = text.toLowerCase();
      const normalized = raw.replace(/[^a-z0-9\s]/g, '').trim();
      const compact = normalized.replace(/\s+/g, '');
      console.log(`[VoiceDetector] Evaluating transcript: "${text}" (normalized: "${normalized}", compact: "${compact}")`);

      const matchesTarget = 
        // Direct compact keyword matches
        compact.includes('safehersos') ||
        compact.includes('safeersos') ||
        compact.includes('safersos') ||
        compact.includes('savehersos') ||
        compact.includes('safehairsos') ||
        compact.includes('safairsos') ||
        compact.includes('safecaresos') ||
        compact.includes('helpsafeher') ||
        compact.includes('helpsafeer') ||
        compact.includes('helpsafer') ||
        compact.includes('helpsaveher') ||
        compact.includes('sossafeher') ||
        compact.includes('safeherhelp') ||
        compact.includes('safeheremergency') ||
        compact.includes('saveme') ||
        // Words with spaces in normalized
        normalized.includes('safeher sos') ||
        normalized.includes('safe her sos') ||
        normalized.includes('save her sos') ||
        normalized.includes('safe hair sos') ||
        normalized.includes('safe care sos') ||
        normalized.includes('safeer sos') ||
        normalized.includes('safer sos') ||
        normalized.includes('help safeher') ||
        normalized.includes('help safe her') ||
        normalized.includes('sos safeher') ||
        normalized.includes('sos safe her') ||
        normalized.includes('safeher help') ||
        normalized.includes('safe her help') ||
        // SOS alone or separated: "s o s" / "sos"
        compact === 'sos' ||
        compact.startsWith('sos') ||
        compact.endsWith('sos') ||
        normalized === 'sos' ||
        normalized === 's o s' ||
        normalized.includes(' sos ') ||
        normalized.endsWith(' sos') ||
        normalized.startsWith('sos ') ||
        // SafeHer alone or with keywords
        compact === 'safeher' ||
        compact === 'safeer' ||
        compact === 'saveher' ||
        ((compact.includes('safeher') || compact.includes('saveher') || compact.includes('safer') || compact.includes('safeer')) && 
         (compact.includes('sos') || compact.includes('help') || compact.includes('emergency')));

      if (matchesTarget) {
        console.log(`[VoiceDetector] Qualifying trigger phrase matched: "${text}"`);
        this.lastTriggerTime = now;
        if (typeof this.onTriggerCallback === 'function') {
          this.onTriggerCallback(text);
        }
        break;
      }
    }
  };

  _updateStatus = (active, message) => {
    if (typeof this.onStatusChangeCallback === 'function') {
      this.onStatusChangeCallback({ isListening: active, message });
    }
  };
}

export const voiceDetector = new VoiceDetector();
