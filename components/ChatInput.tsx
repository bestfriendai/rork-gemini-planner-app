import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Alert, Modal, Text } from 'react-native';
import { Send, Mic, MicOff, Square, X, Check } from 'lucide-react-native';
import { useSpeechStore } from '@/store/speechStore';

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
    startListening, 
    stopListening, 
    startRecording, 
    stopRecording,
    setRecordedText,
    clearRecordedText
  } = useSpeechStore();

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const toggleListening = () => {
    if (Platform.OS === 'web') {
      if (isListening) {
        stopListening();
      } else {
        startListening((text: string) => {
          setMessage(prev => (prev + ' ' + text).trim());
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
      setMessage(prev => (prev + ' ' + recordedText).trim());
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
      return isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />;
    } else {
      return <Mic size={20} color="#fff" />;
    }
  };

  const getMicButtonStyle = () => {
    if (Platform.OS === 'web') {
      return [styles.micButton, isListening && styles.micButtonActive];
    } else {
      return styles.micButton;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message or ask about current events..."
          placeholderTextColor="#A0A9B8"
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          editable={!isLoading}
        />
        
        <TouchableOpacity 
          style={getMicButtonStyle()} 
          onPress={toggleListening}
          disabled={isLoading}
        >
          {getMicIcon()}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Mobile Recording Modal */}
      <Modal
        visible={showRecordModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelRecording}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Voice Input</Text>
              <TouchableOpacity onPress={handleCancelRecording}>
                <X size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.recordingIndicator}>
              <View style={[styles.recordingDot, isRecording && styles.recordingDotActive]} />
              <Text style={styles.recordingText}>
                {isRecording ? 'Recording... Speak now!' : 'Ready to record'}
              </Text>
            </View>
            
            <Text style={styles.instructionText}>
              On mobile, voice-to-text transcription happens manually. Speak your message, then type what you said below and tap "Use Text".
            </Text>
            
            <TextInput
              style={styles.recordedTextInput}
              value={recordedText}
              onChangeText={setRecordedText}
              placeholder="Type what you said here..."
              placeholderTextColor="#A0A9B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={isRecording ? handleStopRecording : startRecording}
              >
                {isRecording ? <Square size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Stop' : 'Record'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.useButton, !recordedText.trim() && styles.useButtonDisabled]}
                onPress={handleUseRecordedText}
                disabled={!recordedText.trim()}
              >
                <Check size={20} color="#fff" />
                <Text style={styles.useButtonText}>Use Text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    color: '#1A1A1A',
  },
  sendButton: {
    backgroundColor: '#4A86E8',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A9B8',
  },
  micButton: {
    backgroundColor: '#F9A826',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  micButtonActive: {
    backgroundColor: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6E7A8A',
    marginRight: 8,
  },
  recordingDotActive: {
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 14,
    color: '#6E7A8A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  recordedTextInput: {
    backgroundColor: '#F9FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    marginBottom: 20,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9A826',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A86E8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  useButtonDisabled: {
    backgroundColor: '#A0A9B8',
  },
  useButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});