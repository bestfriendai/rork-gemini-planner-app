import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { QuickActions } from '@/components/QuickActions';
import { TodaySummary } from '@/components/TodaySummary';
import { InteractiveTaskPrompt } from '@/components/InteractiveTaskPrompt';
import { aiService } from '@/services';
import { getCurrentDate } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';

export default function AssistantScreen() {
  const flatListRef = useRef<FlatList>(null);
  const { messages, addMessage, clearMessages, isLoading, setLoading, formatMessagesForAPI } = useChatStore();
  const { tasks, addTask } = useTaskStore();
  const { username } = useSettingsStore();

  const today = useMemo(() => getCurrentDate(), []);
  const todaysTasks = useMemo(() => tasks.filter(t => t.date === today && !t.completed), [tasks, today]);
  
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

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
        ? `Hello ${username}! I'm Jarva, your AI assistant. Today is ${currentDate} and it's ${currentTime}. I can help you plan your day, create tasks, search the web for current information, answer questions, and much more. What would you like to do?` 
        : `Hello! I'm Jarva, your AI assistant. Today is ${currentDate} and it's ${currentTime}. I can help you plan your day, create tasks, search the web for current information, answer questions, and much more. What would you like to do?`;
      
      addMessage({
        role: 'assistant',
        content: greeting,
      });
    }
  }, [messages, username, initialMessageSent]);

  const handleSendMessage = async (content: string) => {
    setShowTaskPrompt(false);
    setExtractedTasks([]);
    
    addMessage({
      role: 'user',
      content,
    });
    
    setLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    
    try {
      const apiMessages = formatMessagesForAPI();
      
      const response = await aiService.processQuery(apiMessages, (chunk: string) => {
        setStreamingMessage(prev => prev + chunk);
      });
      
      const finalResponse = response || streamingMessage;
      addMessage({
        role: 'assistant',
        content: finalResponse,
      });
      
      const tasks = aiService.extractTasks(finalResponse);
      
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

  const handleConfirmExtractedTasks = (confirmedTasks: any[]) => {
    if (confirmedTasks.length > 0) {
      confirmedTasks.forEach(task => addTask(task));
      Alert.alert(
        "Tasks Added",
        `${confirmedTasks.length} task${confirmedTasks.length > 1 ? 's' : ''} added to your planner.`,
        [{ text: "OK" }]
      );
    }
    setShowTaskPrompt(false);
    setExtractedTasks([]);
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
        <FlatList
          ref={flatListRef}
          data={displayMessages}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <TodaySummary
              username={username}
              taskCount={todaysTasks.length}
            />
          }
          ListEmptyComponent={
             <View style={styles.emptyContainer}>
                <EmptyState />
                <QuickActions onAction={handleQuickAction} />
            </View>
          }
          renderItem={({ item }) => (
            <ChatMessage
              message={item}
              isStreaming={item.id === 'streaming'}
            />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
        
        {showTaskPrompt && extractedTasks.length > 0 && (
          <InteractiveTaskPrompt
            tasks={extractedTasks}
            onConfirm={handleConfirmExtractedTasks}
            onDismiss={() => {
              setShowTaskPrompt(false);
              setExtractedTasks([]);
            }}
          />
        )}
        
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
  },
  messageList: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 180 : 160,
  },
});