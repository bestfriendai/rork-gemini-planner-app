import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Send, Mic, Sparkles } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';
import { useSpeechStore } from '@/store/speechStore';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const { 
    startRecording, 
    stopRecording, 
    isRecording, 
    recordedText, 
    clearRecordedText,
    startListening,
    isSupported,
    checkSupport
  } = useSpeechStore();

  useEffect(() => {
    // Check if speech recognition is supported
    checkSupport();
  }, []);

  useEffect(() => {
    // Update message with recorded text when available
    if (recordedText) {
      setMessage(prev => prev + (prev ? ' ' : '') + recordedText);
      clearRecordedText();
    }
  }, [recordedText]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleMicPress = () => {
    if (Platform.OS === 'web') {
      // For web, use the Web Speech API
      startListening((text) => {
        setMessage(prev => prev + (prev ? ' ' : '') + text);
      });
    } else {
      // For native platforms, toggle recording state
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.aiButton}>
          <Sparkles size={20} color={colors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Message Jarva..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={[styles.micButton, isRecording && styles.micButtonActive]} 
          onPress={handleMicPress}
          disabled={isLoading || !isSupported}
        >
          <Mic size={22} color={isRecording ? colors.primary : colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Send size={22} color={message.trim() ? colors.text : colors.textTertiary} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 0.5, // Apple uses thinner borders
    borderTopColor: colors.borderLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24, // Apple uses rounded input fields
    paddingHorizontal: 12, // Slightly tighter padding
    paddingVertical: 8, // Slightly tighter padding
    borderWidth: 0.5, // Apple uses thinner borders
    borderColor: colors.borderLight,
    ...shadows.card, // Using Apple-style card shadow
  },
  input: {
    flex: 1,
    fontSize: 17, // SF Pro Text standard size
    color: colors.text,
    maxHeight: 120,
    marginRight: 8, // Slightly tighter spacing
    paddingVertical: 8,
    fontWeight: '400', // SF Pro Text Regular
    lineHeight: 22, // Apple line height
    letterSpacing: -0.41, // Apple's SF Pro has tighter letter spacing
  },
  aiButton: {
    width: 36, // Slightly smaller for Apple style
    height: 36, // Slightly smaller for Apple style
    borderRadius: 18, // Perfect circle
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    borderWidth: 0, // Apple typically doesn't use borders on buttons
    ...shadows.button, // Using Apple-style button shadow
  },
  micButton: {
    width: 36, // Slightly smaller for Apple style
    height: 36, // Slightly smaller for Apple style
    borderRadius: 18, // Perfect circle
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 0, // Apple typically doesn't use borders on buttons
    ...shadows.button, // Using Apple-style button shadow
  },
  sendButton: {
    width: 36, // Slightly smaller for Apple style
    height: 36, // Slightly smaller for Apple style
    borderRadius: 18, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderWidth: 0, // Apple typically doesn't use borders on buttons
    ...shadows.button, // Using Apple-style button shadow
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceTertiary,
    opacity: 0.7, // Apple uses more subtle opacity changes
  },
  micButtonActive: {
    backgroundColor: colors.primaryMuted,
    transform: [{ scale: 1.05 }], // Apple uses subtle scale effects for active states
  },
});