import Constants from 'expo-constants';
import { trpcClient } from '@/lib/trpc';

// API Configuration - Read from secure backend
export const API_CONFIG = {
  openrouter: {
    apiKey: '',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash-lite-preview-06-17'
  },
  perplexity: {
    apiKey: '',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'sonar-small-online'
  }
};

// Initialize API keys from backend
export const initializeAPIKeys = async (): Promise<void> => {
  try {
    console.log('=== Initializing API Keys from Backend ===');
    
    // Fetch OpenRouter API key
    const openrouterResponse = await trpcClient.api.getKey.query({ 
      service: 'openrouter' 
    });
    API_CONFIG.openrouter.apiKey = openrouterResponse.apiKey;
    
    // Fetch Perplexity API key
    const perplexityResponse = await trpcClient.api.getKey.query({ 
      service: 'perplexity' 
    });
    API_CONFIG.perplexity.apiKey = perplexityResponse.apiKey;
    
    console.log('OpenRouter Key from backend:', API_CONFIG.openrouter.apiKey ? `${API_CONFIG.openrouter.apiKey.substring(0, 15)}...` : 'NOT SET');
    console.log('Perplexity Key from backend:', API_CONFIG.perplexity.apiKey ? `${API_CONFIG.perplexity.apiKey.substring(0, 15)}...` : 'NOT SET');
  } catch (error) {
    console.error('Failed to initialize API keys from backend:', error);
    // Fallback to any keys in app config (for development only)
    if (Constants.expoConfig?.extra?.OPENROUTER_API_KEY) {
      console.log('Using fallback OpenRouter key from app config');
      API_CONFIG.openrouter.apiKey = Constants.expoConfig.extra.OPENROUTER_API_KEY;
    }
    
    if (Constants.expoConfig?.extra?.PERPLEXITY_API_KEY) {
      console.log('Using fallback Perplexity key from app config');
      API_CONFIG.perplexity.apiKey = Constants.expoConfig.extra.PERPLEXITY_API_KEY;
    }
  }
};

// Debug logging for API keys
export const logAPIConfig = (): void => {
  console.log('=== API Configuration Debug ===');
  console.log('OpenRouter Key:', API_CONFIG.openrouter.apiKey ? `${API_CONFIG.openrouter.apiKey.substring(0, 15)}...` : 'NOT SET');
  console.log('Perplexity Key:', API_CONFIG.perplexity.apiKey ? `${API_CONFIG.perplexity.apiKey.substring(0, 15)}...` : 'NOT SET');
};

// Validate API keys
export const validateAPIKeys = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  console.log('=== Validating API Keys ===');
  console.log('OpenRouter Key:', API_CONFIG.openrouter.apiKey ? `${API_CONFIG.openrouter.apiKey.substring(0, 15)}...` : 'NOT SET');
  console.log('Perplexity Key:', API_CONFIG.perplexity.apiKey ? `${API_CONFIG.perplexity.apiKey.substring(0, 15)}...` : 'NOT SET');
  
  if (!API_CONFIG.openrouter.apiKey) {
    errors.push('OpenRouter API key is missing');
  } else if (!API_CONFIG.openrouter.apiKey.startsWith('sk-or-')) {
    errors.push('OpenRouter API key format is invalid');
  }
  
  if (!API_CONFIG.perplexity.apiKey) {
    errors.push('Perplexity API key is missing');
  } else if (!API_CONFIG.perplexity.apiKey.startsWith('pplx-')) {
    errors.push('Perplexity API key format is invalid');
  }
  
  console.log('Validation result:', { valid: errors.length === 0, errors });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// App Configuration
export const APP_CONFIG = {
  name: 'Jarva AI',
  version: '2.0.0',
  build: '2025.1',
  environment: __DEV__ ? 'development' : 'production',
  apiTimeout: 30000, // 30 seconds
  maxRetries: 3,
  rateLimits: {
    openrouter: 200, // requests per minute
    perplexity: 100  // requests per minute
  }
};

// Feature Flags
export const FEATURES = {
  webSearch: true,
  voiceInput: true,
  locationAwareness: true,
  moodTracking: true,
  smartSuggestions: true
};