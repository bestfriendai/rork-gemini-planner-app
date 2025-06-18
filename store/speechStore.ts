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
      const supported = !!(
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition
      );
      set({ isSupported: supported });
      return supported;
    } else {
      set({ isSupported: true });
      return true;
    }
  },
  
  speak: async (text, messageId) => {
    get().stopSpeaking();
    
    try {
      if (Platform.OS === 'web') {
        if (!window.speechSynthesis) {
          console.warn('Speech synthesis not supported in this browser');
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onend = () => {
          set({ isSpeaking: false, currentMessageId: null });
        };
        
        utterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          set({ isSpeaking: false, currentMessageId: null });
        };
        
        window.speechSynthesis.speak(utterance);
        set({ isSpeaking: true, currentMessageId: messageId });
      } else {
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
    
    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    try {
      get().stopListening();

      const recognition = new SpeechRecognitionClass() as SpeechRecognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      let hasResult = false;
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            hasResult = true;
            callback(transcript.trim());
          }
        }
      };
      
      recognition.onend = () => {
        set({ isListening: false });
        if (!hasResult) {
          console.log('No speech detected');
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        set({ isListening: false });
      };
      
      recognition.start();
      set({ isListening: true });
      
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
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
    
    set({ isListening: false });
  },

  startRecording: () => {
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