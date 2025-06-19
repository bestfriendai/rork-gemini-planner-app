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

// Debug logging for API keys
console.log('=== API Configuration Debug ===');
console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
console.log('OpenRouter Key from config:', API_CONFIG.openrouter.apiKey ? `${API_CONFIG.openrouter.apiKey.substring(0, 15)}...` : 'NOT SET');
console.log('Perplexity Key from config:', API_CONFIG.perplexity.apiKey ? `${API_CONFIG.perplexity.apiKey.substring(0, 15)}...` : 'NOT SET');

// Validate API keys on app start
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