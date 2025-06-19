import Constants from 'expo-constants';

// API Configuration - Read from app.config.js extra section
export const API_CONFIG = {
  openrouter: {
    apiKey: Constants.expoConfig?.extra?.OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash-lite-preview-06-17'
  },
  perplexity: {
    apiKey: Constants.expoConfig?.extra?.PERPLEXITY_API_KEY || '',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'sonar-small-online'
  }
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