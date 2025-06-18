import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert } from 'react-native';
import { Send, Mic, MicOff } from 'lucide-react-native';
import { useSpeechStore } from '@/store/speechStore';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const { isListening, startListening, stopListening } = useSpeechStore();

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const toggleListening = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(
        "Speech Recognition",
        "Speech-to-text is currently only available on web browsers. On mobile, you can use voice output by tapping the speaker icon on assistant messages.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening((text: string) => {
        setMessage(prev => (prev + ' ' + text).trim());
      });
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
        style={[styles.micButton, isListening && styles.micButtonActive]} 
        onPress={toggleListening}
        disabled={isLoading}
      >
        {isListening ? (
          <MicOff size={20} color="#fff" />
        ) : (
          <Mic size={20} color="#fff" />
        )}
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
});