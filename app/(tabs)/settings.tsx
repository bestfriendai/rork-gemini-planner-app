import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';
import { User, Bell, Trash2, Moon, Info, Volume2, Wifi, Globe, Smartphone, Monitor, Mic, Speaker, Zap, Brain, Clock, Calendar } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSpeechStore } from '@/store/speechStore';
import { SettingsItem } from '@/components/SettingsItem';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

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
  
  // Check speech support on mount
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
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      />
      
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
                  <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingsItem
              title="Your Name"
              subtitle={username || "Set your name"}
              icon={<User size={22} color={colors.primary} />}
              onPress={() => setEditingName(true)}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistant Features</Text>
          
          <SettingsItem
            title="Text-to-Speech"
            subtitle="Allow assistant to speak responses"
            icon={<Speaker size={22} color={colors.primary} />}
            isSwitch
            switchValue={textToSpeech}
            onSwitchChange={toggleTextToSpeech}
          />
          
          <SettingsItem
            title="Voice Input"
            subtitle={getSpeechRecognitionStatus()}
            icon={<Mic size={22} color={Platform.OS === 'web' && isSupported ? colors.primary : colors.warning} />}
            isSwitch
            switchValue={voiceInput}
            onSwitchChange={setVoiceInput}
          />
          
          <SettingsItem
            title="Web Search"
            subtitle="Enable internet search for current information"
            icon={<Globe size={22} color={colors.primary} />}
            isSwitch
            switchValue={webSearch}
            onSwitchChange={setWebSearch}
          />
          
          <SettingsItem
            title="Smart Suggestions"
            subtitle="Get intelligent quick action suggestions"
            icon={<Brain size={22} color={colors.primary} />}
            isSwitch
            switchValue={smartSuggestions}
            onSwitchChange={setSmartSuggestions}
          />
          
          <SettingsItem
            title="Auto Task Extraction"
            subtitle="Automatically detect and suggest tasks from conversations"
            icon={<Zap size={22} color={colors.primary} />}
            isSwitch
            switchValue={autoTaskExtraction}
            onSwitchChange={setAutoTaskExtraction}
          />
          
          <SettingsItem
            title="Notifications"
            subtitle="Receive reminders for scheduled tasks"
            icon={<Bell size={22} color={colors.primary} />}
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
              (isSupported ? <Monitor size={22} color={colors.primary} /> : <Monitor size={22} color={colors.error} />) : 
              <Smartphone size={22} color={colors.warning} />
            }
          />
          
          <SettingsItem
            title="Voice Output"
            subtitle="Text-to-speech available on all platforms"
            icon={<Volume2 size={22} color={colors.primary} />}
          />
          
          <SettingsItem
            title="Web Search"
            subtitle="Real-time internet search via Perplexity AI"
            icon={<Wifi size={22} color={colors.primary} />}
          />
          
          <SettingsItem
            title="Task Management"
            subtitle="Create, organize, and track your tasks"
            icon={<Bell size={22} color={colors.primary} />}
          />
          
          <SettingsItem
            title="Real-time Data"
            subtitle="Access to current time, date, and device information"
            icon={<Clock size={22} color={colors.primary} />}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingsItem
            title="Clear Chat History"
            subtitle="Delete all conversations with the assistant"
            icon={<Trash2 size={22} color={colors.error} />}
            onPress={handleClearHistory}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          <SettingsItem
            title="Current Date"
            subtitle={dateTime.date}
            icon={<Calendar size={22} color={colors.primary} />}
          />
          
          <SettingsItem
            title="Current Time"
            subtitle={`${dateTime.time} (${dateTime.timezone})`}
            icon={<Clock size={22} color={colors.primary} />}
          />
          
          <SettingsItem
            title="Platform"
            subtitle={Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS} App (v${Platform.Version})`}
            icon={<Info size={22} color={colors.primary} />}
          />
          
          <SettingsItem
            title="App Version"
            subtitle="3.0.0 - Modern 2030 Design & Enhanced AI"
            icon={<Info size={22} color={colors.primary} />}
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingTop: 24,
    letterSpacing: 0.5,
  },
  editNameContainer: {
    padding: 24,
    backgroundColor: colors.surface,
  },
  nameInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    fontWeight: '500',
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
  statsContainer: {
    margin: 24,
    padding: 32,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    marginHorizontal: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpSection: {
    margin: 24,
    padding: 32,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    marginBottom: 120,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  helpBold: {
    fontWeight: '800',
    color: colors.primary,
  },
});