import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { MessageSquare, ListPlus, Sparkles, Zap } from 'lucide-react-native';
import { useChatStore } from '@/store/chatStore';
import { useTaskStore } from '@/store/taskStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import { QuickActions } from '@/components/QuickActions';
import { callAI, extractTasksFromAIResponse } from '@/utils/aiUtils';
import { colors } from '@/constants/colors';

export default function AssistantScreen() {
  const flatListRef = useRef<FlatList>(null);
  const { messages, addMessage, clearMessages, isLoading, setLoading, formatMessagesForAPI } = useChatStore();
  const { addTask } = useTaskStore();
  const { username } = useSettingsStore();
  
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Send welcome message when app first loads
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
        ? `Hello ${username}! I'm Jarva, your intelligent personal assistant. Today is ${currentDate} and it's currently ${currentTime}. I can help you plan your day, create tasks, search the web for current information, answer questions, calculate math problems, and much more. Try asking me to schedule something for you or search for recent news!` 
        : `Hello! I'm Jarva, your intelligent personal assistant. Today is ${currentDate} and it's currently ${currentTime}. I can help you plan your day, create tasks, search the web for current information, answer questions, calculate math problems, and much more. Try asking me to schedule something for you or search for recent news!`;
      
      addMessage({
        role: 'assistant',
        content: greeting,
      });
    }
  }, [messages, username, initialMessageSent]);

  const handleSendMessage = async (content: string) => {
    // Reset task prompt
    setShowTaskPrompt(false);
    setExtractedTasks([]);
    
    // Add user message to chat
    addMessage({
      role: 'user',
      content,
    });
    
    // Set loading state
    setLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    
    try {
      // Prepare messages for API
      const apiMessages = formatMessagesForAPI();
      
      // Call AI API with streaming
      const response = await callAI(apiMessages, (chunk: string) => {
        setStreamingMessage(prev => prev + chunk);
      });
      
      // Add final AI response to chat
      const finalResponse = response || streamingMessage;
      addMessage({
        role: 'assistant',
        content: finalResponse,
      });
      
      // Check if the response contains tasks that should be added
      const tasks = extractTasksFromAIResponse(finalResponse);
      
      if (tasks.length > 0) {
        setExtractedTasks(tasks);
        setShowTaskPrompt(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message with more helpful information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      addMessage({
        role: 'assistant',
        content: `I apologize, but I encountered a connection issue: ${errorMessage}. Please check your internet connection and try again. If the problem persists, try rephrasing your question or asking something else. I'm here to help with planning, current information, calculations, and more!`,
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
      'weather': 'What is the current weather in my location?',
      'news': 'What are the latest news headlines today?',
      'stocks': 'What are the current stock market trends?',
      'crypto': 'What are the current cryptocurrency prices for Bitcoin and Ethereum?',
      'schedule': 'Help me plan my day',
      'reminder': 'Set a reminder for me',
      'calculate': 'Help me calculate 15% tip on $45.50',
      'location': 'What is my current location?',
      'recipe': 'Give me some healthy recipe ideas for dinner',
      'travel': 'What are some popular travel destinations right now?',
      'music': 'What are the trending songs and artists this week?',
      'books': 'Recommend some popular books to read',
      'health': 'Give me some daily health and wellness tips',
      'productivity': 'Share some productivity tips for better focus',
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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 || streamingMessage) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingMessage]);

  // Prepare messages for display including streaming
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
        {displayMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Jarva AI Assistant"
              message="Your intelligent companion for productivity, planning, and getting things done. Ask me anything!"
              icon={<Zap size={72} color={colors.primary} />}
            />
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
          <TouchableOpacity 
            style={styles.taskPrompt}
            onPress={handleAddExtractedTasks}
          >
            <View style={styles.taskPromptContent}>
              <ListPlus size={20} color={colors.primary} />
              <Text style={styles.taskPromptText}>
                Add {extractedTasks.length} task{extractedTasks.length > 1 ? 's' : ''} to your planner
              </Text>
            </View>
          </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 120,
  },
  taskPrompt: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  taskPromptText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 12,
    fontSize: 16,
  },
});