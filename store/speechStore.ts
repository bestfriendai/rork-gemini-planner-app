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
  speak: (text: string, messageId: string) => void;
  stopSpeaking: () => void;
  startListening: (callback: (text: string) => void) => void;
  stopListening: () => void;
}

export const useSpeechStore = create<SpeechState>((set, get) => ({
  isSpeaking: false,
  isListening: false,
  currentMessageId: null,
  
  speak: async (text, messageId) => {
    // Stop any current speech
    get().stopSpeaking();
    
    if (Platform.OS === 'web') {
      // Web: Use Speech Synthesis API
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set voice (optional)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Google')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Handle speech end
      utterance.onend = () => {
        set({ isSpeaking: false, currentMessageId: null });
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      set({ isSpeaking: true, currentMessageId: messageId });
    } else {
      // Mobile: Use expo-speech
      try {
        await Speech.speak(text, {
          language: 'en-US',
          pitch: 1.0,
          rate: 1.0,
          onDone: () => {
            set({ isSpeaking: false, currentMessageId: null });
          },
          onError: () => {
            set({ isSpeaking: false, currentMessageId: null });
          },
        });
        
        set({ isSpeaking: true, currentMessageId: messageId });
      } catch (error) {
        console.error('Speech not available on this platform:', error);
      }
    }
  },
  
  stopSpeaking: async () => {
    if (Platform.OS === 'web') {
      window.speechSynthesis.cancel();
    } else {
      try {
        await Speech.stop();
      } catch (error) {
        console.error('Speech not available on this platform:', error);
      }
    }
    set({ isSpeaking: false, currentMessageId: null });
  },
  
  startListening: (callback) => {
    if (Platform.OS !== 'web') {
      console.log('Speech recognition only available on web');
      return;
    }
    
    // Check if browser supports speech recognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    // Create recognition instance
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Store recognition instance in window to access it later
    (window as any).speechRecognition = recognition;
    
    // Handle results
    recognition.onresult = (event: any) => {
      const results = Array.from({ length: event.results.length }, (_, i) => event.results[i]);
      const transcript = results
        .map((result: any) => {
          const alternative = result[0] as SpeechRecognitionAlternative;
          return alternative.transcript;
        })
        .join('');
      
      if (event.results[event.results.length - 1].isFinal) {
        callback(transcript);
      }
    };
    
    // Handle end (restart if still listening)
    recognition.onend = () => {
      if (get().isListening) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          set({ isListening: false });
        }
      }
    };
    
    // Handle errors
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
      set({ isListening: false });
    };
    
    // Start listening
    try {
      recognition.start();
      set({ isListening: true });
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  },
  
  stopListening: () => {
    if (Platform.OS !== 'web') return;
    
    if ((window as any).speechRecognition) {
      (window as any).speechRecognition.stop();
      (window as any).speechRecognition = null;
    }
    
    set({ isListening: false });
  },
}));