import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { User, Bell, Trash2, Info, Volume2, Globe, Mic, Speaker, Zap, Brain, Clock, Calendar, BarChart, Cpu } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { SettingsItem } from '@/components/SettingsItem';
import { colors } from '@/constants/colors';
import { aiService } from '@/services';

export default function SettingsScreen() {
  const { username, setUsername, notifications, toggleNotifications } = useSettingsStore();
  const { clearMessages } = useChatStore();
  const { tasks } = useTaskStore();
  
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [aiStats, setAiStats] = useState<any>(null);
  
  useEffect(() => {
    // Get AI performance statistics
    const stats = aiService.getPerformanceStats();
    setAiStats(stats);
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
            clearMessages();
          }
        }
      ]
    );
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
              icon={<User size={18} color={colors.primary} strokeWidth={1.5} />}
              onPress={() => setEditingName(true)}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistant Features</Text>
          
          <SettingsItem
            title="Text-to-Speech"
            subtitle="Allow assistant to speak responses"
            icon={<Speaker size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          
          <SettingsItem
            title="Voice Input"
            subtitle="Speech recognition for voice commands"
            icon={<Mic size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          
          <SettingsItem
            title="Web Search"
            subtitle="Enable internet search for current information"
            icon={<Globe size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          
          <SettingsItem
            title="Smart Suggestions"
            subtitle="Get intelligent quick action suggestions"
            icon={<Brain size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          
          <SettingsItem
            title="Auto Task Extraction"
            subtitle="Automatically detect and suggest tasks"
            icon={<Zap size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          
          <SettingsItem
            title="Notifications"
            subtitle="Receive reminders for scheduled tasks"
            icon={<Bell size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={notifications}
            onSwitchChange={toggleNotifications}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Performance</Text>
          
          <SettingsItem
            title="Response Caching"
            subtitle="Cache similar queries for faster responses"
            icon={<Zap size={18} color={colors.primary} strokeWidth={1.5} />}
            isSwitch
            switchValue={true}
            onSwitchChange={() => {}}
          />
          
          <SettingsItem
            title="Performance Metrics"
            subtitle="View AI response times and usage statistics"
            icon={<BarChart size={18} color={colors.primary} strokeWidth={1.5} />}
            onPress={() => {
              const stats = aiService.getPerformanceStats();
              setAiStats(stats);
              Alert.alert(
                "AI Performance Metrics",
                `Average Response Time: ${stats.averageResponseTime}ms\n` +
                `Cache Hit Rate: ${stats.cacheHitRate}%\n` +
                `Total Requests: ${stats.totalRequests}\n` +
                `Error Rate: ${stats.errorRate}%`,
                [{ text: "OK" }]
              );
            }}
          />
          
          <SettingsItem
            title="Clear AI Cache"
            subtitle="Delete cached responses and performance data"
            icon={<Trash2 size={18} color={colors.error} strokeWidth={1.5} />}
            onPress={() => {
              Alert.alert(
                "Clear AI Cache",
                "Are you sure you want to clear all cached AI responses? This may slow down future responses.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Clear", 
                    style: "destructive",
                    onPress: () => {
                      aiService.invalidateCache(['all']);
                      aiService.clearMetrics();
                      Alert.alert("Cache Cleared", "All AI cache and performance data has been cleared.");
                    }
                  }
                ]
              );
            }}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <SettingsItem
            title="Clear Chat History"
            subtitle="Delete all conversations with the assistant"
            icon={<Trash2 size={18} color={colors.error} strokeWidth={1.5} />}
            onPress={handleClearHistory}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          
          <SettingsItem
            title="Current Date"
            subtitle={dateTime.date}
            icon={<Calendar size={18} color={colors.primary} strokeWidth={1.5} />}
          />
          
          <SettingsItem
            title="Current Time"
            subtitle={`${dateTime.time} (${dateTime.timezone})`}
            icon={<Clock size={18} color={colors.primary} strokeWidth={1.5} />}
          />
          
          <SettingsItem
            title="Platform"
            subtitle={Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS} App`}
            icon={<Info size={18} color={colors.primary} strokeWidth={1.5} />}
          />
          
          <SettingsItem
            title="App Version"
            subtitle="5.0.0 - Modern 2025 Design"
            icon={<Info size={18} color={colors.primary} strokeWidth={1.5} />}
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
        </View>
        
        {aiStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>AI Performance Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{aiStats.totalRequests || 0}</Text>
                <Text style={styles.statLabel}>Total Requests</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{aiStats.averageResponseTime ? Math.round(aiStats.averageResponseTime) + 'ms' : '-'}</Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{aiStats.cacheHitRate ? Math.round(aiStats.cacheHitRate) + '%' : '-'}</Text>
                <Text style={styles.statLabel}>Cache Hit Rate</Text>
              </View>
            </View>
          </View>
        )}
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
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    fontWeight: '400',
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 13,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 120,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});