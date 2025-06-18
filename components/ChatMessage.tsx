import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, User, Bot } from 'lucide-react-native';
import { Message } from '@/types';
import { useSpeechStore } from '@/store/speechStore';
import { colors } from '@/constants/colors';

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
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        {isUser ? (
          <User size={12} color={colors.text} strokeWidth={1.5} />
        ) : (
          <Bot size={12} color={colors.primary} strokeWidth={1.5} />
        )}
      </View>

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        
        {isStreaming && (
          <View style={styles.streamingIndicator}>
            <View style={styles.streamingDot} />
            <Text style={styles.streamingText}>Thinking...</Text>
          </View>
        )}
        
        {!isStreaming && !isUser && (
          <TouchableOpacity 
            style={styles.speakButton} 
            onPress={handleToggleSpeech}
          >
            {isThisMessageSpeaking ? (
              <VolumeX size={10} color={colors.textTertiary} strokeWidth={1.5} />
            ) : (
              <Volume2 size={10} color={colors.textTertiary} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 2,
  },
  userAvatar: {
    backgroundColor: colors.surfaceSecondary,
  },
  assistantAvatar: {
    backgroundColor: colors.primaryMuted,
  },
  bubble: {
    borderRadius: 8,
    flex: 1,
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    backgroundColor: colors.primary,
    marginLeft: 32,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    marginRight: 32,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  userText: {
    color: colors.text,
  },
  assistantText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: '400',
    position: 'absolute',
    bottom: -12,
  },
  userTimestamp: {
    color: colors.textTertiary,
    right: 8,
  },
  assistantTimestamp: {
    color: colors.textTertiary,
    left: 8,
  },
  speakButton: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    padding: 2,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  streamingDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.primary,
    marginRight: 4,
  },
  streamingText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '400',
  },
});