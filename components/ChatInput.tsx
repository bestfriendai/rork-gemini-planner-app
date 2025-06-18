import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, Modal, Text } from 'react-native';
import { Send, Mic, MicOff, Square, X, Check, Volume2, Sparkles } from 'lucide-react-native';
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
              <LinearGradient
                colors={isListening ? [colors.error, '#FF6B6B'] : [colors.accent, colors.primary]}
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
                colors={(!message.trim() || isLoading) ? [colors.textQuaternary, colors.textTertiary] : [colors.primary, colors.accent]}
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
                    colors={isRecording ? [colors.error, '#FF6B6B'] : [colors.accent, colors.primary]}
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
                    colors={!recordedText.trim() ? [colors.textQuaternary, colors.textTertiary] : [colors.primary, colors.accent]}
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  blurContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    maxHeight: 120,
    marginRight: 16,
    paddingVertical: 4,
    letterSpacing: 0.2,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    overflow: 'hidden',
  },
  micButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: colors.glass,
    padding: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textTertiary,
    marginRight: 12,
  },
  recordingDotActive: {
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 16,
    flex: 1,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  recordedTextInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 28,
    minHeight: 120,
    letterSpacing: 0.2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  recordButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  useButton: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  useButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  recordButtonText: {
    color: colors.text,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  useButtonText: {
    color: colors.text,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  helpContainer: {
    backgroundColor: colors.surfaceTertiary,
    padding: 20,
    borderRadius: 16,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  helpBold: {
    fontWeight: '700',
    color: colors.accent,
  },
});