import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Animated, Text } from 'react-native';
import { Send, Mic, Plus, Paperclip } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(56)).current;

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
      
      // Animate send button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  useEffect(() => {
    if (message.trim()) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [message]);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: isFocused ? 72 : 56,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      {isFocused && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
            <Plus size={18} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.7}>
            <Paperclip size={18} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}
      
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            height: heightAnim,
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            }),
            borderColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.border, colors.primary + '60'],
            }),
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Message Jarva..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          editable={!isLoading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        <View style={styles.inputActions}>
          <TouchableOpacity 
            style={styles.micButton} 
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Mic size={20} color={colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                (!message.trim() || isLoading) && styles.sendButtonDisabled
              ]} 
              onPress={handleSend}
              disabled={isLoading || !message.trim()}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Send 
                  size={20} 
                  color={colors.text} 
                  strokeWidth={2} 
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
      
      {message.length > 0 && (
        <Text style={styles.characterCount}>
          {message.length}/1000
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  quickActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
    marginRight: 12,
    paddingVertical: 12,
    fontWeight: '400',
    lineHeight: 22,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
    shadowOpacity: 0,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
});