import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';
import { User, Bell, Trash2, Moon, Info, Volume2, Wifi, Globe, Smartphone, Monitor, Mic, Speaker } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSpeechStore } from '@/store/speechStore';
import { SettingsItem } from '@/components/SettingsItem';

export default function SettingsScreen() {
  const { username, setUsername, notifications, toggleNotifications } = useSettingsStore();
  const { clearMessages } = useChatStore();
  const { tasks } = useTaskStore();
  const { stopSpeaking } = useSpeechStore();
  
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [textToSpeech, setTextToSpeech] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [voiceInput, setVoiceInput] = useState(true);
  
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
          subtitle={Platform.OS === 'web' ? "Speech-to-text available" : "Recording available (manual transcription)"}
          icon={<Mic size={22} color="#4A86E8" />}
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
          subtitle={Platform.OS === 'web' ? "Full speech-to-text available" : "Recording with manual transcription"}
          icon={Platform.OS === 'web' ? <Monitor size={22} color="#4A86E8" /> : <Smartphone size={22} color="#F9A826" />}
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
          icon={<Info size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Current Time"
          subtitle={`${dateTime.time} (${dateTime.timezone})`}
          icon={<Info size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="Platform"
          subtitle={Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS} App (v${Platform.Version})`}
          icon={<Info size={22} color="#4A86E8" />}
        />
        
        <SettingsItem
          title="App Version"
          subtitle="1.0.0 - Personal Assistant"
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
});