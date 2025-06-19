import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, trpcClient } from '@/lib/trpc';
import { initializeAPIKeys, validateAPIKeys } from '@/utils/config';

// Create a client
const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Continue anyway - we can proceed without custom fonts if needed
      SplashScreen.hideAsync();
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [apiInitialized, setApiInitialized] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const initAPI = async () => {
      try {
        await initializeAPIKeys();
        const validation = validateAPIKeys();
        
        if (!validation.valid) {
          setApiError(validation.errors.join(', '));
        } else {
          setApiInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize API:', error);
        setApiError('Failed to initialize API keys. Please check your connection.');
      }
    };
    
    initAPI();
  }, []);

  if (apiError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>API Configuration Error</Text>
        <Text style={styles.errorMessage}>{apiError}</Text>
        <Text style={styles.errorHint}>Please check your API keys and connection.</Text>
      </View>
    );
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="task/[id]" options={{ title: 'Task Details' }} />
        </Stack>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#dc3545',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  errorHint: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});