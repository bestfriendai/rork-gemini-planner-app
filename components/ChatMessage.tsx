import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Volume2, User, Bot } from 'lucide-react-native';
import { Message } from '@/types';
import { colors } from '@/constants/colors';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container, 
        isUser ? styles.userContainer : styles.assistantContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        {isUser ? (
          <User size={16} color={colors.text} strokeWidth={2} />
        ) : (
          <Bot size={16} color={colors.primary} strokeWidth={2} />
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
          <TouchableOpacity style={styles.speakButton} activeOpacity={0.7}>
            <Volume2 size={14} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      
      {!isStreaming && (
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </Animated.View>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userAvatar: {
    backgroundColor: colors.surfaceSecondary,
  },
  assistantAvatar: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary + '30',
  },
  bubble: {
    borderRadius: 20,
    flex: 1,
    position: 'relative',
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userBubble: {
    backgroundColor: colors.primary,
    marginLeft: 40,
    borderBottomRightRadius: 8,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    marginRight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 8,
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
    fontSize: 11,
    marginTop: 6,
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
  speakButton: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    padding: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  streamingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});