import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Text, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { QuickActions } from '@/components/QuickActions';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { TaskItem } from '@/components/TaskItem';
import { callAI, extractTasksFromAIResponse } from '@/utils/aiUtils';
import { colors } from '@/constants/colors';
import { getCurrentDate, formatDateForDisplay } from '@/utils/dateUtils';

export default function HomeScreen() {
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const { messages, addMessage, clearMessages, isLoading, setLoading, formatMessagesForAPI } = useChatStore();
  const { tasks, addTask } = useTaskStore();
  const { username } = useSettingsStore();
  
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const today = getCurrentDate();
  const todayTasks = tasks.filter(task => task.date === today && !task.completed).slice(0, 3);

  useEffect(() => {
    if (messages.length === 0 && !initialMessageSent) {
      setInitialMessageSent(true);
      
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const greeting = username 
        ? `Hello ${username}! I'm Jarva, your AI companion. Today is ${currentDate} and it's ${currentTime}. I've got an overview of your day ready. You have ${todayTasks.length} tasks pending. How can I help you today?` 
        : `Hello! I'm Jarva, your AI companion. Today is ${currentDate} and it's ${currentTime}. I've got an overview of your day ready. You have ${todayTasks.length} tasks pending. How can I help you today?`;
      
      addMessage({
        role: 'assistant',
        content: greeting,
      });
    }
  }, [messages, username, initialMessageSent, todayTasks]);

  useEffect(() => {
    if (showTaskPrompt) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showTaskPrompt]);

  const handleSendMessage = async (content: string) => {
    setShowTaskPrompt(false);
    setExtractedTasks([]);
    setShowChat(true);
    
    addMessage({
      role: 'user',
      content,
    });
    
    setLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    
    try {
      const apiMessages = formatMessagesForAPI();
      
      const response = await callAI(apiMessages, (chunk: string) => {
        setStreamingMessage(prev => prev + chunk);
      });
      
      const finalResponse = response || streamingMessage;
      addMessage({
        role: 'assistant',
        content: finalResponse,
      });
      
      const tasks = extractTasksFromAIResponse(finalResponse);
      
      if (tasks.length > 0) {
        setExtractedTasks(tasks);
        setShowTaskPrompt(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      addMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an issue: ${errorMessage}. Please check your connection and try again.`,
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleQuickAction = (action: string) => {
    const quickActions: { [key: string]: string } = {
      'current_time': 'What time is it right now?',
      'today_date': 'What is today\'s date?',
      'weather': 'What is the current weather?',
      'news': 'What are the latest news headlines?',
      'stocks': 'What are the current stock market trends?',
      'crypto': 'What are the current cryptocurrency prices?',
      'schedule': 'Help me plan my day',
      'reminder': 'Set a reminder for me',
      'calculate': 'Help me calculate something',
      'location': 'What is my current location?',
    };
    
    const message = quickActions[action];
    if (message) {
      handleSendMessage(message);
    }
  };

  const handleAddExtractedTasks = () => {
    if (extractedTasks.length > 0) {
      extractedTasks.forEach(task => {
        addTask(task);
      });
      
      Alert.alert(
        "Tasks Added",
        `${extractedTasks.length} task${extractedTasks.length > 1 ? 's' : ''} added to your planner.`,
        [{ text: "OK" }]
      );
      
      setShowTaskPrompt(false);
      setExtractedTasks([]);
    }
  };

  useEffect(() => {
    if (messages.length > 0 || streamingMessage) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingMessage]);

  const displayMessages = [...messages];
  if (isStreaming && streamingMessage) {
    displayMessages.push({
      id: 'streaming',
      role: 'assistant' as const,
      content: streamingMessage,
      timestamp: Date.now(),
    });
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 1 && !showChat ? (
          <View style={styles.emptyContainer}>
            <EmptyState />
            {todayTasks.length > 0 && (
              <View style={styles.todayTasksContainer}>
                <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
                {todayTasks.map(task => (
                  <TaskItem key={task.id} task={task} onPress={() => {}} />
                ))}
              </View>
            )}
            <QuickActions onAction={handleQuickAction} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatMessage 
                message={item} 
                isStreaming={item.id === 'streaming'}
              />
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        {showTaskPrompt && extractedTasks.length > 0 && (
          <Animated.View 
            style={[
              styles.taskPrompt,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.taskPromptContent}
              onPress={handleAddExtractedTasks}
              activeOpacity={0.8}
            >
              <View style={styles.taskPromptIcon}>
                <Plus size={16} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.taskPromptText}>
                <Text style={styles.taskPromptTitle}>
                  Add {extractedTasks.length} task{extractedTasks.length > 1 ? 's' : ''} to planner
                </Text>
                <Text style={styles.taskPromptSubtitle}>
                  Tap to add these tasks to your schedule
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {isLoading && <LoadingIndicator />}
        
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  todayTasksContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  messageList: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 200 : 180,
  },
  taskPrompt: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  taskPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskPromptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskPromptText: {
    flex: 1,
  },
  taskPromptTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  taskPromptSubtitle: {
    color: colors.textTertiary,
    fontSize: 13,
    fontWeight: '400',
  },
});