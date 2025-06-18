import Constants from 'expo-constants';

export const API_CONFIG = {
  openrouter: {
    apiKey: Constants.expoConfig?.extra?.OPENROUTER_API_KEY || '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',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-flash-1.5'
  },
  perplexity: {
    apiKey: Constants.expoConfig?.extra?.PERPLEXITY_API_KEY || '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',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'llama-3.1-sonar-large-128k-online'
  }
};

export const validateApiKeys = () => {
  const errors: string[] = [];
  
  if (!API_CONFIG.openrouter.apiKey || API_CONFIG.openrouter.apiKey === 'your-openrouter-key-here') {
    errors.push('OpenRouter API key is missing or invalid');
  }
  
  if (!API_CONFIG.perplexity.apiKey || API_CONFIG.perplexity.apiKey === 'your-perplexity-key-here') {
    errors.push('Perplexity API key is missing or invalid');
  }
  
  if (errors.length > 0) {
    console.warn(`API Configuration Warning: ${errors.join(', ')}`);
    return false;
  }
  
  return true;
};

// Rate limiting configuration
export const RATE_LIMITS = {
  openrouter: { requests: 200, window: 60000 }, // 200 requests per minute
  perplexity: { requests: 100, window: 60000 }   // 100 requests per minute
};

// Model configurations for different use cases
export const MODEL_TIERS = {
  economy: {
    openrouter: 'google/gemini-flash-1.5',
    perplexity: 'llama-3.1-sonar-small-128k-online'
  },
  balanced: {
    openrouter: 'anthropic/claude-3-5-sonnet',
    perplexity: 'llama-3.1-sonar-large-128k-online'
  },
  premium: {
    openrouter: 'openai/gpt-4o',
    perplexity: 'llama-3.1-sonar-large-128k-online'
  }
};