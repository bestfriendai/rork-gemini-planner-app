import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Volume2, VolumeX, Sparkles } from 'lucide-react-native';
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
            colors={[colors.primary, colors.accent]}
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
                <View style={styles.streamingDot} />
                <Text style={styles.streamingText}>Thinking...</Text>
              </View>
            )}
            
            {!isStreaming && (
              <TouchableOpacity 
                style={styles.speakButton} 
                onPress={handleToggleSpeech}
              >
                <LinearGradient
                  colors={isThisMessageSpeaking ? [colors.accent, colors.primary] : [colors.surfaceSecondary, colors.surfaceTertiary]}
                  style={styles.speakButtonGradient}
                >
                  {isThisMessageSpeaking ? (
                    <VolumeX size={16} color={colors.text} />
                  ) : (
                    <Volume2 size={16} color={colors.textSecondary} />
                  )}
                </LinearGradient>
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
    marginVertical: 12,
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
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  userBubble: {
    marginLeft: 48,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    marginRight: 48,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  userBubbleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  assistantBubbleContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  userText: {
    color: colors.text,
    fontWeight: '500',
  },
  assistantText: {
    color: colors.text,
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  userTimestamp: {
    color: colors.textTertiary,
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  assistantTimestamp: {
    color: colors.textTertiary,
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  speakButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    borderRadius: 16,
    overflow: 'hidden',
  },
  speakButtonGradient: {
    padding: 8,
    borderRadius: 16,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  streamingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  streamingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});