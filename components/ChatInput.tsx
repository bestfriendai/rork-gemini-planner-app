import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Send, Mic, MicOff, Square } from 'lucide-react-native';
import { useSpeechStore } from '@/store/speechStore';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const { isListening, isRecording, startListening, stopListening, startRecording, stopRecording } = useSpeechStore();

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const toggleListening = () => {
    if (Platform.OS === 'web') {
      if (isListening) {
        stopListening();
      } else {
        startListening((text: string) => {
          setMessage(prev => (prev + ' ' + text).trim());
        });
      }
    } else {
      // For mobile, show a simple recording indicator
      if (isRecording) {
        stopRecording();
        Alert.alert(
          "Voice Input",
          "Voice-to-text transcription is not available on mobile. You can type your message or use the voice output feature by tapping the speaker icon on assistant messages.",
          [{ text: "OK" }]
        );
      } else {
        startRecording();
        Alert.alert(
          "Recording",
          "Recording started. Tap the microphone again to stop. Note: Automatic transcription is only available on web browsers.",
          [
            { text: "Stop Recording", onPress: () => stopRecording() },
            { text: "Continue", style: "cancel" }
          ]
        );
      }
    }
  };

  const getMicIcon = () => {
    if (Platform.OS === 'web') {
      return isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />;
    } else {
      return isRecording ? <Square size={20} color="#fff" /> : <Mic size={20} color="#fff" />;
    }
  };

  const getMicButtonStyle = () => {
    if (Platform.OS === 'web') {
      return [styles.micButton, isListening && styles.micButtonActive];
    } else {
      return [styles.micButton, isRecording && styles.micButtonRecording];
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message or ask about current events..."
        placeholderTextColor="#A0A9B8"
        multiline
        maxLength={500}
        onSubmitEditing={handleSend}
        editable={!isLoading}
      />
      
      <TouchableOpacity 
        style={getMicButtonStyle()} 
        onPress={toggleListening}
        disabled={isLoading}
      >
        {getMicIcon()}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
        onPress={handleSend}
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Send size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    color: '#1A1A1A',
  },
  sendButton: {
    backgroundColor: '#4A86E8',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A9B8',
  },
  micButton: {
    backgroundColor: '#F9A826',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
  },
});