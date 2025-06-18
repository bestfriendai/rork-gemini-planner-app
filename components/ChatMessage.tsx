import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Volume2, User, Bot, ThumbsUp, Copy } from 'lucide-react-native';
import { Message } from '@/types';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

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
          <User size={18} color={colors.text} strokeWidth={1.5} />
        ) : (
          <Bot size={18} color={colors.primary} strokeWidth={1.5} />
        )}
      </View>

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
        
        {isStreaming && (
          <View style={styles.streamingIndicator}>
            <View style={styles.streamingDot} />
            <View style={styles.streamingDot2} />
            <View style={styles.streamingDot3} />
            <Text style={styles.streamingText}>Thinking...</Text>
          </View>
        )}
        
        {/* Action buttons removed as requested */}
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
    maxWidth: '92%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
  },
  userContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.medium,
  },
  userAvatar: {
    backgroundColor: colors.secondary,
  },
  assistantAvatar: {
    backgroundColor: colors.primaryMuted,
  },
  bubble: {
    borderRadius: 20,
    flex: 1,
    position: 'relative',
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...shadows.medium,
  },
  userBubble: {
    backgroundColor: colors.primary,
    marginLeft: 40,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceSecondary,
    marginRight: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  userText: {
    color: colors.text,
  },
  assistantText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    position: 'absolute',
    bottom: -18,
  },
  userTimestamp: {
    color: colors.textTertiary,
    right: 10,
  },
  assistantTimestamp: {
    color: colors.textTertiary,
    left: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.small,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 4,
    opacity: 1,
  },
  streamingDot2: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 4,
    opacity: 0.7,
  },
  streamingDot3: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
    opacity: 0.4,
  },
  streamingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});