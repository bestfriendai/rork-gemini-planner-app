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
      {/* Avatar */}
      <View style={[styles.avatar, isUser ? styles.userAvatar : styles.assistantAvatar]}>
        {isUser ? (
          <User size={14} color={colors.text} />
        ) : (
          <Bot size={14} color={colors.primary} />
        )}
      </View>

      {/* Message bubble */}
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
              <VolumeX size={12} color={colors.textTertiary} />
            ) : (
              <Volume2 size={12} color={colors.textTertiary} />
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubble: {
    borderRadius: 12,
    flex: 1,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: colors.primary,
    marginLeft: 32,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    marginRight: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
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
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    position: 'absolute',
    bottom: -16,
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
    bottom: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  streamingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  streamingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  streamingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});