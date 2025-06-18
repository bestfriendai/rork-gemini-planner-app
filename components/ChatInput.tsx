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

  // Check speech support on component mount
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
      // For mobile, show recording modal
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
      return isListening ? <MicOff size={20} color={colors.error} /> : <Mic size={20} color={colors.textSecondary} />;
    } else {
      return <Mic size={20} color={colors.textSecondary} />;
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
              <Send size={20} color={message.trim() ? colors.primary : colors.textTertiary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Recording Modal */}
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
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
                <Text style={styles.recordingText}>
                  {isRecording ? 'Recording... Speak now!' : 'Ready to record'}
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <Volume2 size={20} color={colors.primary} />
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
                    {isRecording ? <Square size={16} color={colors.text} /> : <Mic size={16} color={colors.text} />}
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
                    <Check size={16} color={colors.text} />
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
    paddingBottom: Platform.OS === 'ios' ? 100 : 84,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
    marginRight: 12,
    paddingVertical: 0,
    fontWeight: '400',
    lineHeight: 22,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  micButtonActive: {
    backgroundColor: colors.error + '20',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: colors.glass,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
    marginRight: 8,
  },
  recordingDotActive: {
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  recordedTextInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    minHeight: 100,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  recordButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: colors.error,
  },
  useButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  useButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recordButtonText: {
    color: colors.text,
    fontWeight: '700',
    marginLeft: 8,
  },
  useButtonText: {
    color: colors.text,
    fontWeight: '700',
    marginLeft: 8,
  },
  helpContainer: {
    backgroundColor: colors.surfaceTertiary,
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
    fontWeight: '500',
  },
  helpBold: {
    fontWeight: '700',
    color: colors.accent,
  },
});