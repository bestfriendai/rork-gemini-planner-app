import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';
import { User, Bell, Trash2, Moon, Info, Volume2, Wifi, Globe, Smartphone, Monitor, Mic, Speaker, Zap, Brain, Clock, Calendar } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSpeechStore } from '@/store/speechStore';
import { SettingsItem } from '@/components/SettingsItem';

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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        {editingName ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor="#A0A9B8"
              autoFocus
            />
            <View style={styles.editNameButtons}>
              <TouchableOpacity 
                style={[styles.editNameButton, styles.cancelButton]}
                onPress={() => {
                  setNameInput(username);
                  setEditingName(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editNameButton, styles.saveButton]}
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
            icon={<User size={22} color="#4A86E8" />}
            onPress={() => setEditingName(true)}
          />
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistant Features</Text>
        
        <SettingsItem
          title="Text-to-Speech"
          subtitle="Allow assistant to speak responses"
          icon={<Speaker size={22} color="#4A86E8" />}
          isSwitch
          switchValue={textToSpeech}
          onSwitchChange={toggleTextToSpeech}
        />
        
        <SettingsItem
          title="Voice Input"
          subtitle={getSpeechRecognitionStatus()}
          icon={<Mic size={22} color={Platform.OS === 'web' && isSupported ? "#4A86E8" : "#F9A826"} />}
          isSwitch
          switchValue={voiceInput}
          onSwitchChange={setVoiceInput}
        />
        
        <SettingsItem
          title="Web Search"
          subtitle="Enable internet search for current information"
          icon={<Globe size={22} color="#4A86E8" />}
          isSwitch
          switchValue={webSearch}
          onSwitchChange={setWebSearch}
        />
        
        <SettingsItem
          title="Smart Suggestions"
          subtitle="Get intelligent quick action suggestions"
          icon={<Brain size={22} color="#4A86E8" />}
          isSwitch
          switchValue={smartSuggestions}
          onSwitchChange={setSmartSuggestions}
        />
        
        <SettingsItem
          title="Auto Task Extraction"
          subtitle="Automatically detect and suggest tasks from conversations"
          icon={<Zap size={22} color="#4A86E8" />}
          isSwitch
          switchValue={autoTaskExtraction}
          onSwitchChange={setAutoTaskExtraction}
        />
        
        <SettingsItem
          title="Notifications"
          subtitle="Receive reminders for scheduled tasks"
          icon={<Bell size={22} color="#4A86E8" />}
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
            (isSupported ? <Monitor size={22} color="#4A86E8" /> : <Monitor size={22} color="#FF3B30" />) : 
            <Smartphone size={22} color="#F9A826" />
          }
        />
        
        <SettingsItem
          title="Voice Output"
          subtitle="Text-to-speech available on all platforms"
          icon={<Volume2 size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Web Search"
          subtitle="Real-time internet search via Perplexity AI"
          icon={<Wifi size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Task Management"
          subtitle="Create, organize, and track your tasks"
          icon={<Bell size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Real-time Data"
          subtitle="Access to current time, date, and device information"
          icon={<Clock size={22} color="#4A86E8" />}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <SettingsItem
          title="Clear Chat History"
          subtitle="Delete all conversations with the assistant"
          icon={<Trash2 size={22} color="#FF3B30" />}
          onPress={handleClearHistory}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        
        <SettingsItem
          title="Current Date"
          subtitle={dateTime.date}
          icon={<Calendar size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Current Time"
          subtitle={`${dateTime.time} (${dateTime.timezone})`}
          icon={<Clock size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Platform"
          subtitle={Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS} App (v${Platform.Version})`}
          icon={<Info size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="App Version"
          subtitle="2.2.0 - Enhanced Voice Features & Improved API Reliability"
          icon={<Info size={22} color="#4A86E8" />}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E7A8A',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  editNameContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  nameInput: {
    backgroundColor: '#F9FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  editNameButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F9FAFC',
  },
  saveButton: {
    backgroundColor: '#4A86E8',
  },
  cancelButtonText: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFC',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A86E8',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6E7A8A',
  },
  helpSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#E8F1FF',
    borderRadius: 12,
    marginBottom: 32,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 8,
  },
  helpBold: {
    fontWeight: '600',
    color: '#4A86E8',
  },
});