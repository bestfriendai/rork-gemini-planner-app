// API Configuration
export const API_CONFIG = {
  openrouter: {
    apiKey: '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',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash-lite-preview-06-17'
  },
  perplexity: {
    apiKey: process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || '',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'sonar-small-online'
  }
};

// App Configuration
export const APP_CONFIG = {
  name: 'Jarva AI',
  version: '2.0.0',
  build: '2025.1',
  environment: process.env.NODE_ENV || 'development',
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