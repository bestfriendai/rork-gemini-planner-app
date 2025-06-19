import React, { useEffect } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { EmptyState } from '@/components/EmptyState';
import StatusIndicator from '@/components/StatusIndicator';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { messages, isLoading, addMessage, isInitialized, initializeAPI } = useChatStore();
  const flatListRef = React.useRef<FlatList>(null);

  useEffect(() => {
    // Initialize API keys when component mounts
    if (!isInitialized) {
      initializeAPI();
    }
  }, [isInitialized, initializeAPI]);

  const handleSendMessage = async (text: string) => {
    if (text.trim().length === 0) return;
    
    await addMessage({
      role: 'user',
      content: text,
    });
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusIndicator />
      
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatMessage message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      
      {isLoading && <LoadingIndicator />}
      
      <ChatInput />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
});