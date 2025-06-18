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
          <User size={16} color={colors.text} />
        ) : (
          <Bot size={16} color={colors.primary} />
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
              <VolumeX size={14} color={colors.textTertiary} />
            ) : (
              <Volume2 size={14} color={colors.textTertiary} />
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
    marginVertical: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 2,
  },
  userAvatar: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantAvatar: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  bubble: {
    borderRadius: 20,
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
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
    position: 'absolute',
    bottom: -18,
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
    bottom: 8,
    right: 12,
    padding: 6,
    borderRadius: 8,
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