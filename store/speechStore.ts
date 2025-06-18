import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import type { 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent, 
  SpeechRecognition
} from '@/types/speech';

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
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    try {
      // Stop any existing recognition
      get().stopListening();

      // Create recognition instance
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      let hasResult = false;
      
      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            hasResult = true;
            callback(transcript.trim());
          }
        }
      };
      
      // Handle end
      recognition.onend = () => {
        set({ isListening: false });
        if (!hasResult) {
          console.log('No speech detected');
        }
      };
      
      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        set({ isListening: false });
      };
      
      // Start listening
      recognition.start();
      set({ isListening: true });
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (get().isListening) {
          recognition.stop();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      set({ isListening: false });
    }
  },
  
  stopListening: () => {
    if (Platform.OS !== 'web') return;
    
    try {
      // Stop any active recognition
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
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