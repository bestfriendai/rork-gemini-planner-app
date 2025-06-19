import React, { useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Platform,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { EmptyState } from '@/components/EmptyState';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { QuickActions } from '@/components/QuickActions';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useChatStore } from '@/store/chatStore';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
  const { messages, isLoading } = useChatStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerTitle: "Jarva AI",
          headerTitleStyle: {
            color: colors.text,
            fontSize: 20,
            fontWeight: '700',
          },
        }}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <Animated.View style={{ opacity: fadeAnim }}>
              <EmptyState />
              <QuickActions 
                onAction={(action) => {
                  // Handle quick actions
                }}
              />
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
            </Animated.View>
          )}
        </ScrollView>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingIndicator size={32} />
          </View>
        )}

        <ChatInput />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 16,
  },
});