import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

// Web Speech API type definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    speechRecognition?: SpeechRecognition | null;
  }
}

interface SpeechState {
  isSpeaking: boolean;
  isListening: boolean;
  currentMessageId: string | null;
  isRecording: boolean;
  recordedText: string;
  isSupported: boolean;
  speak: (text: string, messageId: string) => void;
  stopSpeaking: () => void;
  startListening: (callback: (text: string) => void) => void;
  stopListening: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setRecordedText: (text: string) => void;
  clearRecordedText: () => void;
  checkSupport: () => boolean;
}

export const useSpeechStore = create<SpeechState>((set, get) => ({
  isSpeaking: false,
  isListening: false,
  currentMessageId: null,
  isRecording: false,
  recordedText: '',
  isSupported: false,
  
  checkSupport: () => {
    if (Platform.OS === 'web') {
      const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      set({ isSupported: supported });
      return supported;
    } else {
      // On mobile, we support voice recording with manual transcription
      set({ isSupported: true });
      return true;
    }
  },
  
  speak: async (text, messageId) => {
    // Stop any current speech
    get().stopSpeaking();
    
    try {
      if (Platform.OS === 'web') {
        // Web: Use Speech Synthesis API
        if (!window.speechSynthesis) {
          console.warn('Speech synthesis not supported in this browser');
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Set voice (optional)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Handle speech end
        utterance.onend = () => {
          set({ isSpeaking: false, currentMessageId: null });
        };
        
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          set({ isSpeaking: false, currentMessageId: null });
        };
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
        set({ isSpeaking: true, currentMessageId: messageId });
      } else {
        // Mobile: Use expo-speech
        await Speech.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 1.0,
          onDone: () => {
            set({ isSpeaking: false, currentMessageId: null });
          },
          onError: (error) => {
            console.error('Mobile speech synthesis error:', error);
            set({ isSpeaking: false, currentMessageId: null });
          },
        });
        
        set({ isSpeaking: true, currentMessageId: messageId });
      }
    } catch (error) {
      console.error('Speech synthesis error:', error);
      set({ isSpeaking: false, currentMessageId: null });
    }
  },
  
  stopSpeaking: async () => {
    try {
      if (Platform.OS === 'web') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } else {
        await Speech.stop();
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
    set({ isSpeaking: false, currentMessageId: null });
  },
  
  startListening: (callback) => {
    if (Platform.OS !== 'web') {
      console.log('Web speech recognition only available on web platform');
      return;
    }
    
    // Check if browser supports speech recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    try {
      // Stop any existing recognition
      if ((window as any).speechRecognition) {
        (window as any).speechRecognition.stop();
        (window as any).speechRecognition = null;
      }

      // Create recognition instance
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // Store recognition instance in window to access it later
      (window as any).speechRecognition = recognition;
      
      let finalTranscript = '';
      let timeoutId: NodeJS.Timeout;
      
      // Handle results
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Call callback with final transcript when available
        if (finalTranscript.trim()) {
          callback(finalTranscript.trim());
          finalTranscript = '';
          
          // Auto-stop after getting result
          setTimeout(() => {
            get().stopListening();
          }, 500);
        }
        
        // Clear timeout and set new one for interim results
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (interimTranscript.trim()) {
            callback(interimTranscript.trim());
          }
          get().stopListening();
        }, 3000); // Stop after 3 seconds of silence
      };
      
      // Handle end
      recognition.onend = () => {
        if (timeoutId) clearTimeout(timeoutId);
        set({ isListening: false });
        if ((window as any).speechRecognition) {
          (window as any).speechRecognition = null;
        }
      };
      
      // Handle errors
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (timeoutId) clearTimeout(timeoutId);
        set({ isListening: false });
        if ((window as any).speechRecognition) {
          (window as any).speechRecognition = null;
        }
      };
      
      // Start listening
      recognition.start();
      set({ isListening: true });
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      set({ isListening: false });
    }
  },
  
  stopListening: () => {
    if (Platform.OS !== 'web') return;
    
    try {
      if ((window as any).speechRecognition) {
        (window as any).speechRecognition.stop();
        (window as any).speechRecognition = null;
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
    
    set({ isListening: false });
  },

  startRecording: () => {
    // For mobile, we'll use a simple recording indicator
    // User can manually type what they said
    set({ isRecording: true, recordedText: '' });
  },

  stopRecording: () => {
    set({ isRecording: false });
  },

  setRecordedText: (text: string) => {
    set({ recordedText: text });
  },

  clearRecordedText: () => {
    set({ recordedText: '' });
  },
}));