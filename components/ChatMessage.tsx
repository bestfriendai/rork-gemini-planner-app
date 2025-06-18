import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, Sparkles, User, Bot } from 'lucide-react-native';
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
      {/* Avatar */}
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        {isUser ? (
          <User size={16} color={colors.text} />
        ) : (
          <Bot size={16} color={colors.primary} />
        )}
      </View>

      {/* Message bubble */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isUser ? (
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            style={styles.userBubbleGradient}
          >
            <Text style={styles.userText}>
              {message.content}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.assistantBubbleContent}>
            <Text style={styles.assistantText}>
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
                    <VolumeX size={14} color={colors.text} />
                  ) : (
                    <Volume2 size={14} color={colors.textSecondary} />
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
    marginVertical: 16,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  userAvatar: {
    backgroundColor: colors.surfaceSecondary,
  },
  assistantAvatar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  bubble: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  assistantBubbleContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  userText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  assistantText: {
    color: colors.text,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
    position: 'absolute',
    bottom: -20,
  },
  userTimestamp: {
    color: colors.textTertiary,
    right: 12,
  },
  assistantTimestamp: {
    color: colors.textTertiary,
    left: 12,
  },
  speakButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    borderRadius: 16,
    overflow: 'hidden',
  },
  speakButtonGradient: {
    padding: 10,
    borderRadius: 16,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
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