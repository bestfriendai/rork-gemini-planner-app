import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Platform,
} from 'react-native';
import { Volume2, Copy, MoreVertical } from 'lucide-react-native';
import { Message } from '@/types';
import { colors } from '@/constants/colors';
import { useSpeechStore } from '@/store/speechStore';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLast }) => {
  const { isSpeaking, currentMessageId, speak, stopSpeaking } = useSpeechStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isUser = message.role === 'user';
  const isPlaying = isSpeaking && currentMessageId === message.id;

  const handleCopy = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleSpeak = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak(message.content, message.id);
    }
  };

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
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>J</Text>
        </View>
      )}

      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
      ]}>
        <Text style={[
          styles.text,
          isUser ? styles.userText : styles.assistantText,
        ]}>
          {message.content}
        </Text>

        <View style={styles.actions}>
          {!isUser && Platform.OS !== 'web' && (
            <TouchableOpacity 
              style={[styles.actionButton, isPlaying && styles.actionButtonActive]} 
              onPress={handleSpeak}
            >
              <Volume2 
                size={14} 
                color={isPlaying ? colors.primary : colors.textTertiary} 
                strokeWidth={2} 
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Copy size={14} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MoreVertical size={14} color={colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: colors.text,
  },
  assistantText: {
    color: colors.text,
  },
  actions: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
    borderRadius: 12,
  },
  actionButtonActive: {
    backgroundColor: colors.primaryMuted,
  },
});