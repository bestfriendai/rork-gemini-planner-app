import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Switch } from 'react-native';
import { User, Bell, Trash2, Info, Volume2, Globe, Mic, Moon, Sun, Lock } from 'lucide-react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { API_CONFIG } from '@/utils/config';
import { apiMonitor } from '@/utils/monitoring';

export default function ProfileScreen() {
  const { username, setUsername, notifications, toggleNotifications, theme, setTheme } = useSettingsStore();
  const { clearMessages } = useChatStore();
  const { tasks } = useTaskStore();
  
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  useEffect(() => {
    // Gather debug information
    const openRouterKey = API_CONFIG.openrouter.apiKey ? 'Set' : 'Not Set';
    const perplexityKey = API_CONFIG.perplexity.apiKey ? 'Set' : 'Not Set';
    const healthStatus = apiMonitor.getHealthStatus();
    const openRouterStatus = healthStatus.find(s => s.service === 'openrouter')?.status || 'Unknown';
    const perplexityStatus = healthStatus.find(s => s.service === 'perplexity')?.status || 'Unknown';
    
    setDebugInfo(`Platform: ${Platform.OS}\nAPI Keys - OpenRouter: ${openRouterKey}, Perplexity: ${perplexityKey}\nService Status - OpenRouter: ${openRouterStatus}, Perplexity: ${perplexityStatus}`);
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
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={48} color={colors.primary} strokeWidth={1.5} />
          </View>
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
            <View style={styles.nameContainer}>
              <Text style={styles.profileName}>{username || "Set your name"}</Text>
              <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Receive reminders for tasks</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              {theme === 'dark' ? <Moon size={18} color={colors.primary} strokeWidth={1.5} /> : <Sun size={18} color={colors.primary} strokeWidth={1.5} />}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingSubtitle}>Switch between light and dark theme</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistant Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Volume2 size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Text-to-Speech</Text>
              <Text style={styles.settingSubtitle}>Allow assistant to speak responses</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Mic size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Voice Input</Text>
              <Text style={styles.settingSubtitle}>Speech recognition for commands</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Globe size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Web Search</Text>
              <Text style={styles.settingSubtitle}>Enable internet search for current info</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearHistory}>
            <View style={styles.settingIcon}>
              <Trash2 size={18} color={colors.error} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Clear Chat History</Text>
              <Text style={styles.settingSubtitle}>Delete all conversations with Jarva</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
            <View style={styles.settingIcon}>
              <Lock size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy Settings</Text>
              <Text style={styles.settingSubtitle}>Manage data and permissions</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Info size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Jarva AI Version</Text>
              <Text style={styles.settingSubtitle}>v2.0.0 - 2025 Edition</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Productivity Stats</Text>
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
        
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Information</Text>
            <Text style={styles.debugText}>{debugInfo}</Text>
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
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primaryMuted,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  editNameContainer: {
    width: '100%',
    marginTop: 8,
  },
  nameInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  section: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  settingIcon: {
    marginRight: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
    fontWeight: '400',
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
  debugContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 40,
  },
  debugTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
    fontWeight: '400',
  },
});