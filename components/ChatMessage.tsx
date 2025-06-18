import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Volume2, VolumeX, Wifi } from 'lucide-react-native';
import { Message } from '@/types';
import { useSpeechStore } from '@/store/speechStore';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

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
        {isUser ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.userBubbleGradient}
          >
            <Text style={[styles.text, styles.userText]}>
              {message.content}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.assistantBubbleContent}>
            <Text style={[styles.text, styles.assistantText]}>
              {message.content}
            </Text>
            
            {isStreaming && (
              <View style={styles.streamingIndicator}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.streamingText}>Thinking...</Text>
              </View>
            )}
            
            {!isStreaming && (
              <TouchableOpacity 
                style={styles.speakButton} 
                onPress={handleToggleSpeech}
              >
                {isThisMessageSpeaking ? (
                  <VolumeX size={16} color={colors.primary} />
                ) : (
                  <Volume2 size={16} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {!isStreaming && (
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  bubble: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    marginLeft: 40,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    marginRight: 40,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  userBubbleGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assistantBubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.text,
    fontWeight: '500',
  },
  assistantText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  userTimestamp: {
    color: colors.textTertiary,
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  assistantTimestamp: {
    color: colors.textTertiary,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  speakButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streamingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});