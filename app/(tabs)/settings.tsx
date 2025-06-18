import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { User, Bell, Trash2, Info, Volume2, Wifi, Globe, Smartphone, Monitor, Mic, Speaker, Zap, Brain, Clock, Calendar } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSpeechStore } from '@/store/speechStore';
import { SettingsItem } from '@/components/SettingsItem';
import { colors } from '@/constants/colors';

export default function SettingsScreen() {
  const { username, setUsername, notifications, toggleNotifications } = useSettingsStore();
  const { clearMessages } = useChatStore();
  const { tasks } = useTaskStore();
  const { stopSpeaking, checkSupport, isSupported } = useSpeechStore();
  
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [voiceInput, setVoiceInput] = useState(true);
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [autoTaskExtraction, setAutoTaskExtraction] = useState(true);
  
  useEffect(() => {
    checkSupport();
  }, []);
  
  const handleSaveName = () => {
    setUsername(nameInput.trim());
    setEditingName(false);
  };
  
  const handleClearHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all chat history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            stopSpeaking();
            clearMessages();
          }
        }
      ]
    );
  };

  const toggleTextToSpeech = () => {
    if (textToSpeech) {
      stopSpeaking();
    }
    setTextToSpeech(!textToSpeech);
  };
  
  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };

  const dateTime = getCurrentDateTime();
  
  const getSpeechRecognitionStatus = () => {
    if (Platform.OS === 'web') {
      return isSupported ? "Full speech-to-text available" : "Not supported in this browser";
    } else {
      return "Voice recording with manual transcription";
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          {editingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
              />
              <View style={styles.editNameButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setNameInput(username);
                    setEditingName(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveName}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingsItem
              title="Your Name"
              subtitle={username || "Set your name"}
              icon={<User size={16} color={colors.primary} strokeWidth={2} />}
              onPress={() => setEditingName(true)}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistant Features</Text>
          
          <SettingsItem
            title="Text-to-Speech"
            subtitle="Allow assistant to speak responses"
            icon={<Speaker size={16} color={colors.primary} strokeWidth={2} />}
            isSwitch
            switchValue={textToSpeech}
            onSwitchChange={toggleTextToSpeech}
          />
          
          <SettingsItem
            title="Voice Input"
            subtitle={getSpeechRecognitionStatus()}
            icon={<Mic size={16} color={Platform.OS === 'web' && isSupported ? colors.primary : colors.warning} strokeWidth={2} />}
            isSwitch
            switchValue={voiceInput}
            onSwitchChange={setVoiceInput}
          />
          
          <SettingsItem
            title="Web Search"
            subtitle="Enable internet search for current information"
            icon={<Globe size={16} color={colors.primary} strokeWidth={2} />}
            isSwitch
            switchValue={webSearch}
            onSwitchChange={setWebSearch}
          />
          
          <SettingsItem
            title="Smart Suggestions"
            subtitle="Get intelligent quick action suggestions"
            icon={<Brain size={16} color={colors.primary} strokeWidth={2} />}
            isSwitch
            switchValue={smartSuggestions}
            onSwitchChange={setSmartSuggestions}
          />
          
          <SettingsItem
            title="Auto Task Extraction"
            subtitle="Automatically detect and suggest tasks from conversations"
            icon={<Zap size={16} color={colors.primary} strokeWidth={2} />}
            isSwitch
            switchValue={autoTaskExtraction}
            onSwitchChange={setAutoTaskExtraction}
          />
          
          <SettingsItem
            title="Notifications"
            subtitle="Receive reminders for scheduled tasks"
            icon={<Bell size={16} color={colors.primary} strokeWidth={2} />}
            isSwitch
            switchValue={notifications}
            onSwitchChange={toggleNotifications}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Capabilities</Text>
          
          <SettingsItem
            title="Speech Recognition"
            subtitle={getSpeechRecognitionStatus()}
            icon={Platform.OS === 'web' ? 
              (isSupported ? <Monitor size={16} color={colors.primary} strokeWidth={2} /> : <Monitor size={16} color={colors.error} strokeWidth={2} />) : 
              <Smartphone size={16} color={colors.warning} strokeWidth={2} />
            }
          />
          
          <SettingsItem
            title="Voice Output"
            subtitle="Text-to-speech available on all platforms"
            icon={<Volume2 size={16} color={colors.primary} strokeWidth={2} />}
          />
          
          <SettingsItem
            title="Web Search"
            subtitle="Real-time internet search via Perplexity AI"
            icon={<Wifi size={16} color={colors.primary} strokeWidth={2} />}
          />
          
          <SettingsItem
            title="Task Management"
            subtitle="Create, organize, and track your tasks"
            icon={<Bell size={16} color={colors.primary} strokeWidth={2} />}
          />
          
          <SettingsItem
            title="Real-time Data"
            subtitle="Access to current time, date, and device information"
            icon={<Clock size={16} color={colors.primary} strokeWidth={2} />}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingsItem
            title="Clear Chat History"
            subtitle="Delete all conversations with the assistant"
            icon={<Trash2 size={16} color={colors.error} strokeWidth={2} />}
            onPress={handleClearHistory}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          <SettingsItem
            title="Current Date"
            subtitle={dateTime.date}
            icon={<Calendar size={16} color={colors.primary} strokeWidth={2} />}
          />
          
          <SettingsItem
            title="Current Time"
            subtitle={`${dateTime.time} (${dateTime.timezone})`}
            icon={<Clock size={16} color={colors.primary} strokeWidth={2} />}
          />
          
          <SettingsItem
            title="Platform"
            subtitle={Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS} App (v${Platform.Version})`}
            icon={<Info size={16} color={colors.primary} strokeWidth={2} />}
          />
          
          <SettingsItem
            title="App Version"
            subtitle="4.0.0 - Modern 2025 Design & Enhanced AI"
            icon={<Info size={16} color={colors.primary} strokeWidth={2} />}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Productivity Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.filter(t => t.completed).length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.filter(t => !t.completed).length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.filter(t => t.priority === 'high').length}</Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).length}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round((tasks.filter(t => t.completed).length / Math.max(tasks.length, 1)) * 100)}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Voice Features Help</Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>Web Browser:</Text> {isSupported ? 'Full speech-to-text recognition available. Click the microphone to start speaking.' : 'Speech recognition not supported in this browser. Please use a modern browser like Chrome or Edge.'}
          </Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>Mobile:</Text> Voice recording with manual transcription. Speak your message, then type what you said in the text field.
          </Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>Text-to-Speech:</Text> Available on all platforms. Tap the speaker icon next to assistant messages to hear them spoken aloud.
          </Text>
          <Text style={styles.helpText}>
            <Text style={styles.helpBold}>AI Services:</Text> Uses Gemini AI for general queries and Perplexity AI for web search with automatic fallback for reliability.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editNameContainer: {
    padding: 16,
    backgroundColor: colors.surface,
  },
  nameInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: '500',
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  statsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helpSection: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  helpBold: {
    fontWeight: '700',
    color: colors.primary,
  },
});