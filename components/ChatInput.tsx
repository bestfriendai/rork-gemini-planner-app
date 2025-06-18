import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, Modal, Text } from 'react-native';
import { Send, Mic, MicOff, Square, X, Check, Volume2 } from 'lucide-react-native';
import { useSpeechStore } from '@/store/speechStore';
import { colors } from '@/constants/colors';
import { BlurView } from 'expo-blur';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { 
    isListening, 
    isRecording, 
    recordedText,
    isSupported,
    startListening, 
    stopListening, 
    startRecording, 
    stopRecording,
    setRecordedText,
    clearRecordedText,
    checkSupport
  } = useSpeechStore();

  useEffect(() => {
    checkSupport();
  }, []);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const toggleListening = () => {
    if (Platform.OS === 'web') {
      if (!isSupported) {
        Alert.alert(
          "Speech Recognition Not Available",
          "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari for voice input."
        );
        return;
      }
      
      if (isListening) {
        stopListening();
      } else {
        startListening((text: string) => {
          setMessage(prev => {
            const newText = prev ? `${prev} ${text}` : text;
            return newText.trim();
          });
        });
      }
    } else {
      setShowRecordModal(true);
      startRecording();
    }
  };

  const handleUseRecordedText = () => {
    if (recordedText.trim()) {
      setMessage(prev => {
        const newText = prev ? `${prev} ${recordedText}` : recordedText;
        return newText.trim();
      });
    }
    setShowRecordModal(false);
    clearRecordedText();
    stopRecording();
  };

  const handleCancelRecording = () => {
    setShowRecordModal(false);
    clearRecordedText();
    stopRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const getMicIcon = () => {
    if (Platform.OS === 'web') {
      return isListening ? <MicOff size={16} color={colors.error} strokeWidth={1.5} /> : <Mic size={16} color={colors.textSecondary} strokeWidth={1.5} />;
    } else {
      return <Mic size={16} color={colors.textSecondary} strokeWidth={1.5} />;
    }
  };

  return (
    <>
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
            style={[styles.micButton, isListening && styles.micButtonActive]} 
            onPress={toggleListening}
            disabled={isLoading}
          >
            {getMicIcon()}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Send size={16} color={message.trim() ? colors.text : colors.textTertiary} strokeWidth={1.5} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showRecordModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelRecording}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={100} style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Voice Input</Text>
                <TouchableOpacity onPress={handleCancelRecording} style={styles.closeButton}>
                  <X size={16} color={colors.text} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
                <Text style={styles.recordingText}>
                  {isRecording ? 'Recording... Speak now!' : 'Ready to record'}
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <Volume2 size={14} color={colors.primary} strokeWidth={1.5} />
                <Text style={styles.instructionText}>
                  Speak your message clearly, then type what you said in the text field below and tap "Use Text".
                </Text>
              </View>
              
              <TextInput
                style={styles.recordedTextInput}
                value={recordedText}
                onChangeText={setRecordedText}
                placeholder="Type what you said here..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.recordButton}
                  onPress={isRecording ? handleStopRecording : startRecording}
                >
                  <View style={styles.modalButtonContent}>
                    {isRecording ? <Square size={12} color={colors.text} strokeWidth={1.5} /> : <Mic size={12} color={colors.text} strokeWidth={1.5} />}
                    <Text style={styles.recordButtonText}>
                      {isRecording ? 'Stop' : 'Record'}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.useButton, !recordedText.trim() && styles.useButtonDisabled]}
                  onPress={handleUseRecordedText}
                  disabled={!recordedText.trim()}
                >
                  <View style={styles.modalButtonContent}>
                    <Check size={12} color={colors.text} strokeWidth={1.5} />
                    <Text style={styles.useButtonText}>Use Text</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>
                  💡 <Text style={styles.helpBold}>Mobile Voice Input:</Text> Record your voice as a reminder, then manually type what you said. This ensures accuracy while we work on automatic speech recognition for mobile.
                </Text>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Adjusted for new tab bar
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    marginRight: 8,
    paddingVertical: 0,
    fontWeight: '400',
    lineHeight: 20,
  },
  micButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  micButtonActive: {
    backgroundColor: colors.error + '20',
  },
  sendButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalBlur: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: colors.glass,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    marginRight: 6,
  },
  recordingDotActive: {
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 11,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 14,
    fontWeight: '400',
  },
  recordedTextInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 20,
    minHeight: 80,
    fontWeight: '400',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recordButton: {
    flex: 1,
    marginRight: 6,
    borderRadius: 8,
    backgroundColor: colors.error,
  },
  useButton: {
    flex: 1,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  useButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  recordButtonText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 12,
  },
  useButtonText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 12,
  },
  helpContainer: {
    backgroundColor: colors.surfaceTertiary,
    padding: 12,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 12,
    fontWeight: '400',
  },
  helpBold: {
    fontWeight: '600',
    color: colors.accent,
  },
});