import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, Modal, Text } from 'react-native';
import { Send, Mic, MicOff, Square, X, Check, Volume2 } from 'lucide-react-native';
import { useSpeechStore } from '@/store/speechStore';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
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
      return isListening ? <MicOff size={20} color={colors.text} /> : <Mic size={20} color={colors.text} />;
    } else {
      return <Mic size={20} color={colors.text} />;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <BlurView intensity={100} style={styles.blurContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message or use voice input..."
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
              <LinearGradient
                colors={isListening ? [colors.error, '#FF6B6B'] : [colors.accent, colors.accentLight]}
                style={styles.buttonGradient}
              >
                {getMicIcon()}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={isLoading || !message.trim()}
            >
              <LinearGradient
                colors={(!message.trim() || isLoading) ? [colors.textQuaternary, colors.textTertiary] : [colors.primary, colors.primaryLight]}
                style={styles.buttonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Send size={20} color={colors.text} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
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
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
                <Text style={styles.recordingText}>
                  {isRecording ? 'Recording... Speak now!' : 'Ready to record'}
                </Text>
              </View>
              
              <View style={styles.instructionContainer}>
                <Volume2 size={24} color={colors.primary} />
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
                  <LinearGradient
                    colors={isRecording ? [colors.error, '#FF6B6B'] : [colors.accent, colors.accentLight]}
                    style={styles.modalButtonGradient}
                  >
                    {isRecording ? <Square size={20} color={colors.text} /> : <Mic size={20} color={colors.text} />}
                    <Text style={styles.recordButtonText}>
                      {isRecording ? 'Stop' : 'Record'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.useButton, !recordedText.trim() && styles.useButtonDisabled]}
                  onPress={handleUseRecordedText}
                  disabled={!recordedText.trim()}
                >
                  <LinearGradient
                    colors={!recordedText.trim() ? [colors.textQuaternary, colors.textTertiary] : [colors.primary, colors.primaryLight]}
                    style={styles.modalButtonGradient}
                  >
                    <Check size={20} color={colors.text} />
                    <Text style={styles.useButtonText}>Use Text</Text>
                  </LinearGradient>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  blurContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 12,
    paddingVertical: 4,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    overflow: 'hidden',
  },
  micButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBlur: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
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
    fontSize: 20,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textTertiary,
    marginRight: 8,
  },
  recordingDotActive: {
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 16,
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
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  recordedTextInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 24,
    minHeight: 100,
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
    overflow: 'hidden',
  },
  useButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  useButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  recordButtonText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  useButtonText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpContainer: {
    backgroundColor: colors.surfaceTertiary,
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  helpBold: {
    fontWeight: '600',
    color: colors.accent,
  },
});