import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Volume2, VolumeX, Wifi } from 'lucide-react-native';
import { Message } from '@/types';
import { useSpeechStore } from '@/store/speechStore';
import { Platform } from 'react-native';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const { speak, stopSpeaking, isSpeaking, currentMessageId } = useSpeechStore();
  
  const isThisMessageSpeaking = isSpeaking && currentMessageId === message.id;

  const handleToggleSpeech = () => {
    if (isThisMessageSpeaking) {
      stopSpeaking();
    } else {
      speak(message.content, message.id);
    }
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        
        {isStreaming && (
          <View style={styles.streamingIndicator}>
            <ActivityIndicator size="small" color="#6E7A8A" />
            <Text style={styles.streamingText}>Thinking...</Text>
          </View>
        )}
        
        {!isUser && !isStreaming && (
          <TouchableOpacity 
            style={styles.speakButton} 
            onPress={handleToggleSpeech}
          >
            {isThisMessageSpeaking ? (
              <VolumeX size={16} color="#6E7A8A" />
            ) : (
              <Volume2 size={16} color="#6E7A8A" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {!isStreaming && (
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#4A86E8',
  },
  assistantBubble: {
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#1A1A1A',
  },
  timestamp: {
    fontSize: 12,
    color: '#6E7A8A',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  speakButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    padding: 4,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streamingText: {
    fontSize: 12,
    color: '#6E7A8A',
    marginLeft: 6,
    fontStyle: 'italic',
  },
});