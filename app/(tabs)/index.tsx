import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Platform,
  Animated,
  KeyboardAvoidingView,
  Text,
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
import { API_CONFIG } from '@/utils/config';
import { apiMonitor } from '@/utils/monitoring';

export default function HomeScreen() {
  const { messages, isLoading } = useChatStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [debugMessage, setDebugMessage] = useState<string>('');

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

  useEffect(() => {
    // Check API key presence and network status for debugging
    const checkApiStatus = () => {
      const openRouterKey = API_CONFIG.openrouter.apiKey ? 'Set' : 'Not Set';
      const perplexityKey = API_CONFIG.perplexity.apiKey ? 'Set' : 'Not Set';
      const healthStatus = apiMonitor.getHealthStatus();
      const openRouterStatus = healthStatus.find(s => s.service === 'openrouter')?.status || 'Unknown';
      const perplexityStatus = healthStatus.find(s => s.service === 'perplexity')?.status || 'Unknown';
      
      setDebugMessage(`API Keys - OpenRouter: ${openRouterKey}, Perplexity: ${perplexityKey}\nService Status - OpenRouter: ${openRouterStatus}, Perplexity: ${perplexityStatus}`);
    };
    
    checkApiStatus();
  }, []);

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
        
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>{debugMessage}</Text>
          </View>
        )}
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
  debugContainer: {
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  debugText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '400',
  },
});