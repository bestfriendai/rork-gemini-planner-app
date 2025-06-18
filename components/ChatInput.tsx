import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Send, Mic } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask Jarva anything..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={styles.micButton} 
          disabled={isLoading}
        >
          <Mic size={18} color={colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Send size={18} color={message.trim() ? colors.text : colors.textTertiary} strokeWidth={1.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 12,
    paddingVertical: 0,
    fontWeight: '400',
    lineHeight: 22,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },
});