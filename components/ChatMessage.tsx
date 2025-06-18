import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, VolumeX, User, Bot } from 'lucide-react-native';
import { Message } from '@/types';
import { colors } from '@/constants/colors';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        {isUser ? (
          <User size={14} color={colors.text} strokeWidth={1.5} />
        ) : (
          <Bot size={14} color={colors.primary} strokeWidth={1.5} />
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
          <TouchableOpacity style={styles.speakButton}>
            <Volume2 size={12} color={colors.textTertiary} strokeWidth={1.5} />
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
    marginVertical: 12,
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
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 2,
  },
  userAvatar: {
    backgroundColor: colors.surfaceSecondary,
  },
  assistantAvatar: {
    backgroundColor: colors.primaryMuted,
  },
  bubble: {
    borderRadius: 12,
    flex: 1,
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    marginLeft: 40,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    marginRight: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  userText: {
    color: colors.text,
  },
  assistantText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '400',
    position: 'absolute',
    bottom: -16,
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
    position: 'absolute',
    bottom: 6,
    right: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  streamingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  streamingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '400',
  },
});