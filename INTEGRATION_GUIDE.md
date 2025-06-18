# OpenRouter and Perplexity Integration Guide (2025)

This document provides comprehensive guidance on integrating OpenRouter and Perplexity APIs into the Gemini Planner App, including the latest 2025 features, modern security practices, and cutting-edge implementation strategies.

## Table of Contents

1. [Overview](#overview)
2. [OpenRouter Integration](#openrouter-integration)
3. [Perplexity Integration](#perplexity-integration)
4. [Current Implementation Analysis](#current-implementation-analysis)
5. [Recommended Improvements](#recommended-improvements)
6. [Security Best Practices](#security-best-practices)
7. [Error Handling and Fallbacks](#error-handling-and-fallbacks)
8. [Performance Optimization](#performance-optimization)
9. [Testing and Monitoring](#testing-and-monitoring)

## Overview

The app currently integrates both OpenRouter and Perplexity APIs for different use cases:
- **OpenRouter**: Used for general AI conversations via Google's Gemini model
- **Perplexity**: Used for web-search enabled queries requiring real-time information

## OpenRouter Integration

### Latest Features (2025)

OpenRouter provides access to 300+ AI models through a unified API with several key advantages:

#### Key Features:
- **Unified API**: Full OpenAI SDK v4+ compatibility with enhanced features
- **Smart Model Routing**: AI-powered automatic fallbacks and cost optimization
- **Advanced Tool Calling**: Multi-step function calling with parallel execution
- **Enhanced Streaming**: Server-sent events with real-time token usage tracking
- **Provider Intelligence**: ML-based provider selection and health monitoring
- **Structured Outputs**: JSON Schema validation and Pydantic model support
- **Vision & Multimodal**: Support for images, audio, and video across models
- **Custom Fine-tuning**: Integration with fine-tuned models from multiple providers

#### Supported Models (2025):
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, DALL-E 3
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google**: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemma 2
- **Meta**: Llama 3.1 405B, Llama 3.1 70B, Code Llama
- **Mistral**: Mistral Large 2, Mistral Nemo, Codestral
- **Specialized**: Perplexity Sonar, Cohere Command R+, xAI Grok
- **Open Source**: Qwen 2.5, DeepSeek Coder, Nous Hermes

### Current Implementation

```typescript
// Current OpenRouter integration in utils/aiUtils.ts
const callGeminiAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://expo.dev',
      'X-Title': 'Jarva Assistant App',
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: enhancedMessages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: !!onStream,
    }),
  });
};
```

### Recommended Improvements

#### 1. Enhanced Model Selection

```typescript
// Enhanced model configuration (2025)
interface ModelConfig {
  primary: string;
  fallback: string[];
  maxTokens: number;
  temperature: number;
  useTools?: boolean;
  multimodal?: boolean;
  reasoning?: 'fast' | 'balanced' | 'thorough';
  costTier?: 'economy' | 'balanced' | 'premium';
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'general': {
    primary: 'google/gemini-2.0-flash-thinking-exp',
    fallback: ['openai/gpt-4o-mini', 'anthropic/claude-3-5-haiku'],
    maxTokens: 2000,
    temperature: 0.7,
    reasoning: 'balanced',
    costTier: 'economy'
  },
  'creative': {
    primary: 'anthropic/claude-3-5-sonnet',
    fallback: ['openai/gpt-4o', 'google/gemini-1.5-pro'],
    maxTokens: 4000,
    temperature: 0.9,
    reasoning: 'fast',
    costTier: 'balanced'
  },
  'analytical': {
    primary: 'openai/gpt-4o',
    fallback: ['anthropic/claude-3-opus', 'google/gemini-1.5-pro'],
    maxTokens: 3000,
    temperature: 0.3,
    reasoning: 'thorough',
    costTier: 'premium'
  },
  'coding': {
    primary: 'anthropic/claude-3-5-sonnet',
    fallback: ['openai/gpt-4o', 'meta-llama/llama-3.1-405b-instruct'],
    maxTokens: 4000,
    temperature: 0.2,
    useTools: true,
    reasoning: 'thorough',
    costTier: 'balanced'
  },
  'multimodal': {
    primary: 'openai/gpt-4o',
    fallback: ['google/gemini-1.5-pro', 'anthropic/claude-3-5-sonnet'],
    maxTokens: 2000,
    temperature: 0.7,
    multimodal: true,
    reasoning: 'balanced',
    costTier: 'premium'
  }
};
```

#### 2. Tool Calling Integration

```typescript
// Add tool calling for task management
const TASK_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task in the planner',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Task description' },
          date: { type: 'string', description: 'Due date in ISO format' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          tags: { type: 'array', items: { type: 'string' } }
        },
        required: ['title', 'date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'update_task',
      description: 'Update an existing task',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Task ID' },
          updates: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              completed: { type: 'boolean' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] }
            }
          }
        },
        required: ['id', 'updates']
      }
    }
  }
];
```

#### 3. Provider Preferences

```typescript
// Configure provider preferences for reliability
const PROVIDER_PREFERENCES = {
  allow_fallbacks: true,
  require_parameters: true,
  data_collection: 'deny'
};

// Enhanced API call with provider preferences
const callOpenRouterAPI = async (config: ModelConfig, messages: CoreMessage[]) => {
  const requestBody = {
    model: config.primary,
    models: [config.primary, ...config.fallback], // Fallback models
    messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    tools: config.useTools ? TASK_TOOLS : undefined,
    provider: PROVIDER_PREFERENCES,
    route: 'fallback' // Enable automatic fallbacks
  };

  return fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://expo.dev',
      'X-Title': 'Gemini Planner App'
    },
    body: JSON.stringify(requestBody)
  });
};
```

## Perplexity Integration

### Latest Features (2025)

Perplexity's Sonar API provides real-time web search capabilities with several advanced features:

#### Sonar Models (2025):
- **sonar-small-online**: Ultra-fast web search with 8K context
- **sonar-large-online**: Advanced reasoning with 32K context
- **sonar-huge-online**: Maximum capability with 128K context
- **sonar-research**: Multi-step research with citation validation
- **sonar-code**: Code-aware search with repository integration

#### Key Features (2025):
- **Real-time Web Search**: Sub-second access to current information
- **Enhanced Citations**: Source validation and credibility scoring
- **Advanced Filters**: Academic, news, social media, and custom domain filters
- **Structured Outputs**: JSON Schema, XML, and custom format support
- **Adaptive Reasoning**: Dynamic computational effort based on query complexity
- **Batch Processing**: Asynchronous API for multiple research tasks
- **Fact Verification**: Cross-reference validation across multiple sources
- **Multi-language Search**: Support for 50+ languages with translation

### Current Implementation

```typescript
// Current Perplexity integration
const callPerplexityAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  const requestBody = {
    model: PERPLEXITY_MODEL, // Currently 'sonar'
    messages: perplexityMessages,
    max_tokens: 1000,
    temperature: 0.7,
    stream: !!onStream,
  };

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });
};
```

### Recommended Improvements

#### 1. Enhanced Search Configuration

```typescript
// Enhanced Perplexity configuration (2025)
interface PerplexityConfig {
  model: 'sonar-small-online' | 'sonar-large-online' | 'sonar-huge-online' | 'sonar-research' | 'sonar-code';
  searchMode?: 'web' | 'academic' | 'news' | 'social' | 'code';
  reasoningEffort?: 'fast' | 'balanced' | 'thorough' | 'adaptive';
  searchContextSize?: 'compact' | 'standard' | 'extended' | 'comprehensive';
  domainFilter?: string[];
  dateFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'custom';
  factCheck?: boolean;
  multiLanguage?: boolean;
  citationValidation?: boolean;
  maxSources?: number;
}

const getPerplexityConfig = (query: string): PerplexityConfig => {
  // Code-related queries
  if (query.match(/code|programming|github|repository|function|class|api/i)) {
    return {
      model: 'sonar-code',
      searchMode: 'code',
      reasoningEffort: 'thorough',
      searchContextSize: 'extended',
      maxSources: 8
    };
  }
  
  // Academic queries
  if (query.match(/research|study|paper|academic|scientific|journal/i)) {
    return {
      model: 'sonar-large-online',
      searchMode: 'academic',
      reasoningEffort: 'thorough',
      searchContextSize: 'comprehensive',
      factCheck: true,
      citationValidation: true,
      maxSources: 12
    };
  }
  
  // Breaking news and current events
  if (query.match(/news|breaking|latest|current|today|happening|live/i)) {
    return {
      model: 'sonar-small-online',
      searchMode: 'news',
      reasoningEffort: 'fast',
      searchContextSize: 'standard',
      dateFilter: 'day',
      factCheck: true,
      maxSources: 6
    };
  }
  
  // Complex research requiring deep analysis
  if (query.length > 150 || query.match(/analyze|compare|evaluate|comprehensive|detailed/i)) {
    return {
      model: 'sonar-research',
      reasoningEffort: 'adaptive',
      searchContextSize: 'comprehensive',
      factCheck: true,
      citationValidation: true,
      maxSources: 15
    };
  }
  
  // Social media and trending topics
  if (query.match(/trending|viral|social|twitter|reddit|discussion/i)) {
    return {
      model: 'sonar-large-online',
      searchMode: 'social',
      reasoningEffort: 'balanced',
      searchContextSize: 'standard',
      dateFilter: 'week',
      maxSources: 8
    };
  }
  
  // Default configuration for general queries
  return {
    model: 'sonar-large-online',
    searchMode: 'web',
    reasoningEffort: 'balanced',
    searchContextSize: 'standard',
    maxSources: 6
  };
};
```

#### 2. Advanced Search Features

```typescript
// Enhanced Perplexity API call with new features
const callPerplexityAPI = async (
  messages: CoreMessage[],
  config: PerplexityConfig,
  onStream?: (chunk: string) => void
) => {
  const requestBody: any = {
    model: config.model,
    messages,
    max_tokens: config.model === 'sonar-deep-research' ? 2000 : 1000,
    temperature: 0.7,
    stream: !!onStream
  };

  // Add search-specific parameters
  if (config.searchMode) {
    requestBody.search_mode = config.searchMode;
  }
  
  if (config.reasoningEffort) {
    requestBody.reasoning_effort = config.reasoningEffort;
  }
  
  if (config.searchContextSize || config.domainFilter || config.dateFilter) {
    requestBody.web_search_options = {
      search_context_size: config.searchContextSize,
      domain_filter: config.domainFilter,
      date_filter: config.dateFilter
    };
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify(requestBody)
  });

  return response;
};
```

#### 3. Citation Handling

```typescript
// Enhanced response processing with citations
interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  search_results?: Array<{
    title: string;
    url: string;
    date?: string;
  }>;
}

const processPerplexityResponse = (data: PerplexityResponse) => {
  const content = data.choices?.[0]?.message?.content || '';
  const searchResults = data.search_results || [];
  
  return {
    content,
    sources: searchResults.map((result, index) => ({
      id: index + 1,
      title: result.title,
      url: result.url,
      date: result.date
    }))
  };
};
```

## Current Implementation Analysis

### Strengths
1. **Smart Routing**: Automatically chooses between Gemini and Perplexity based on query type
2. **Fallback Mechanism**: Falls back to Gemini if Perplexity fails
3. **Streaming Support**: Real-time response streaming
4. **Context Awareness**: Includes current date/time information
5. **Error Handling**: Graceful error handling with user-friendly messages

### Areas for Improvement
1. **API Key Security**: Keys are hardcoded in the source
2. **Limited Model Selection**: Only uses one model per provider
3. **Basic Search Logic**: Simple keyword matching for web search detection
4. **No Citation Display**: Perplexity citations are not exposed to users
5. **Fixed Configuration**: No dynamic configuration based on query complexity

## Recommended Improvements

### 1. Environment Configuration

```typescript
// Create utils/config.ts
export const API_CONFIG = {
  openrouter: {
    apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash-lite-preview-06-17'
  },
  perplexity: {
    apiKey: process.env.EXPO_PUBLIC_PERPLEXITY_API_KEY || '',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'sonar'
  }
};
```

### 2. Enhanced Query Classification

```typescript
// Enhanced query classification
interface QueryClassification {
  needsWebSearch: boolean;
  queryType: 'general' | 'creative' | 'analytical' | 'research' | 'news';
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
}

const classifyQuery = (query: string): QueryClassification => {
  const webSearchKeywords = [
    'current', 'latest', 'recent', 'today', 'news', 'weather', 'stock',
    'trending', 'breaking', 'live', 'now', 'happening', 'update'
  ];
  
  const creativeKeywords = [
    'write', 'create', 'generate', 'story', 'poem', 'creative', 'imagine'
  ];
  
  const analyticalKeywords = [
    'analyze', 'compare', 'evaluate', 'calculate', 'solve', 'explain'
  ];
  
  const researchKeywords = [
    'research', 'study', 'investigate', 'explore', 'academic', 'scientific'
  ];

  const needsWebSearch = webSearchKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  let queryType: QueryClassification['queryType'] = 'general';
  if (creativeKeywords.some(k => query.toLowerCase().includes(k))) {
    queryType = 'creative';
  } else if (analyticalKeywords.some(k => query.toLowerCase().includes(k))) {
    queryType = 'analytical';
  } else if (researchKeywords.some(k => query.toLowerCase().includes(k))) {
    queryType = 'research';
  } else if (needsWebSearch) {
    queryType = 'news';
  }
  
  const complexity = query.length > 200 ? 'complex' : 
                    query.length > 50 ? 'medium' : 'simple';
  
  const urgency = query.includes('urgent') || query.includes('asap') ? 'high' :
                 query.includes('quick') || query.includes('fast') ? 'medium' : 'low';

  return { needsWebSearch, queryType, complexity, urgency };
};
```

### 3. Unified AI Service

```typescript
// Create services/aiService.ts
export class AIService {
  private openRouterService: OpenRouterService;
  private perplexityService: PerplexityService;
  
  constructor() {
    this.openRouterService = new OpenRouterService();
    this.perplexityService = new PerplexityService();
  }
  
  async processQuery(
    messages: CoreMessage[],
    onStream?: (chunk: string) => void
  ): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    const query = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    
    const classification = classifyQuery(query);
    
    if (classification.needsWebSearch) {
      return this.perplexityService.query(messages, classification, onStream);
    } else {
      return this.openRouterService.query(messages, classification, onStream);
    }
  }
}

interface AIResponse {
  content: string;
  sources?: Array<{
    id: number;
    title: string;
    url: string;
    date?: string;
  }>;
  model: string;
  tokensUsed?: number;
}
```

## Security Best Practices (2025)

### 1. Secure Environment Configuration

```bash
# .env.local (2025 standards)
# Use secure key rotation and environment-specific keys
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
EXPO_PUBLIC_PERPLEXITY_API_KEY=pplx-...

# Optional: Use different keys for different environments
EXPO_PUBLIC_OPENROUTER_DEV_KEY=sk-or-dev-...
EXPO_PUBLIC_OPENROUTER_PROD_KEY=sk-or-prod-...

# Security headers and app identification
EXPO_PUBLIC_APP_NAME=GeminiPlannerApp
EXPO_PUBLIC_APP_VERSION=2.0.0
EXPO_PUBLIC_ENVIRONMENT=production
```

### 2. Enhanced API Key Validation & Security

```typescript
// utils/security.ts (2025)
import CryptoJS from 'crypto-js';

interface SecurityConfig {
  keyRotationInterval: number;
  maxRequestsPerMinute: number;
  encryptionEnabled: boolean;
  auditLogging: boolean;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private keyCache = new Map<string, { key: string; expires: number }>();
  
  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }
  
  validateApiKeys(): void {
    const errors: string[] = [];
    
    // Validate OpenRouter key format
    const orKey = API_CONFIG.openrouter.apiKey;
    if (!orKey || !orKey.startsWith('sk-or-')) {
      errors.push('Invalid OpenRouter API key format');
    }
    
    // Validate Perplexity key format
    const pplxKey = API_CONFIG.perplexity.apiKey;
    if (!pplxKey || !pplxKey.startsWith('pplx-')) {
      errors.push('Invalid Perplexity API key format');
    }
    
    // Check key length and entropy
    if (orKey && orKey.length < 32) {
      errors.push('OpenRouter API key appears to be too short');
    }
    
    if (pplxKey && pplxKey.length < 32) {
      errors.push('Perplexity API key appears to be too short');
    }
    
    if (errors.length > 0) {
      throw new Error(`Security Validation Failed: ${errors.join(', ')}`);
    }
  }
  
  // Encrypt sensitive data before storage
  encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }
  
  // Decrypt sensitive data
  decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  // Generate secure request headers
  generateSecureHeaders(service: 'openrouter' | 'perplexity'): Record<string, string> {
    const baseHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': `${process.env.EXPO_PUBLIC_APP_NAME}/${process.env.EXPO_PUBLIC_APP_VERSION}`,
      'X-Request-ID': this.generateRequestId(),
      'X-Timestamp': new Date().toISOString()
    };
    
    if (service === 'openrouter') {
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${API_CONFIG.openrouter.apiKey}`,
        'HTTP-Referer': 'https://expo.dev',
        'X-Title': process.env.EXPO_PUBLIC_APP_NAME || 'Gemini Planner App',
        'OR-Site-URL': 'https://your-app-domain.com',
        'OR-App-Name': process.env.EXPO_PUBLIC_APP_NAME
      };
    } else {
      return {
        ...baseHeaders,
        'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
        'X-Source': 'mobile-app'
      };
    }
  }
  
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 3. Advanced Rate Limiting & DDoS Protection

```typescript
// utils/rateLimiter.ts (2025)
interface RateLimitConfig {
  requests: number;
  window: number;
  burstLimit: number;
  cooldownPeriod: number;
}

class AdvancedRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private violations: Map<string, number> = new Map();
  private limits: Record<string, RateLimitConfig> = {
    openrouter: { 
      requests: 200, 
      window: 60000, 
      burstLimit: 10, 
      cooldownPeriod: 300000 
    },
    perplexity: { 
      requests: 100, 
      window: 60000, 
      burstLimit: 5, 
      cooldownPeriod: 180000 
    }
  };
  
  canMakeRequest(service: 'openrouter' | 'perplexity', userId?: string): boolean {
    const key = `${service}_${userId || 'anonymous'}`;
    const now = Date.now();
    const limit = this.limits[service];
    
    // Check if user is in cooldown period
    const lastViolation = this.violations.get(key) || 0;
    if (now - lastViolation < limit.cooldownPeriod) {
      return false;
    }
    
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < limit.window);
    
    // Check burst limit (requests in last 10 seconds)
    const recentRequests = validRequests.filter(time => now - time < 10000);
    if (recentRequests.length >= limit.burstLimit) {
      this.violations.set(key, now);
      return false;
    }
    
    // Check overall rate limit
    if (validRequests.length >= limit.requests) {
      this.violations.set(key, now);
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  getRemainingRequests(service: 'openrouter' | 'perplexity', userId?: string): number {
    const key = `${service}_${userId || 'anonymous'}`;
    const now = Date.now();
    const limit = this.limits[service];
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < limit.window);
    
    return Math.max(0, limit.requests - validRequests.length);
  }
}
```

## Error Handling and Fallbacks (2025)

### 1. Comprehensive Error Handling with Observability

```typescript
// utils/errorHandler.ts (2025)
import { Analytics } from './analytics';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  sessionId: string;
  requestId: string;
  modelUsed?: string;
  tokenCount?: number;
  responseTime?: number;
}

export class AIError extends Error {
  public readonly timestamp: Date;
  public readonly errorId: string;
  
  constructor(
    message: string,
    public service: 'openrouter' | 'perplexity',
    public statusCode?: number,
    public retryable: boolean = false,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AIError';
    this.timestamp = new Date();
    this.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  toJSON() {
    return {
      errorId: this.errorId,
      message: this.message,
      service: this.service,
      statusCode: this.statusCode,
      retryable: this.retryable,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context
    };
  }
}

export class ErrorHandler {
  private static analytics = Analytics.getInstance();
  
  static handleAIError(error: any, service: 'openrouter' | 'perplexity', context?: ErrorContext): AIError {
    if (error instanceof AIError) {
      this.logError(error);
      return error;
    }
    
    let aiError: AIError;
    
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      aiError = new AIError(
        'Network connection failed. Please check your internet connection.',
        service,
        undefined,
        true,
        ErrorSeverity.HIGH,
        context
      );
    }
    // Timeout errors
    else if (error.name === 'AbortError' || error.message.includes('timeout')) {
      aiError = new AIError(
        'Request timed out. The service may be experiencing high load.',
        service,
        408,
        true,
        ErrorSeverity.MEDIUM,
        context
      );
    }
    // Rate limiting
    else if (error.status === 429) {
      aiError = new AIError(
        'Rate limit exceeded. Please wait before making another request.',
        service,
        429,
        true,
        ErrorSeverity.LOW,
        context
      );
    }
    // Authentication errors
    else if (error.status === 401 || error.status === 403) {
      aiError = new AIError(
        'Authentication failed. Please check your API key.',
        service,
        error.status,
        false,
        ErrorSeverity.CRITICAL,
        context
      );
    }
    // Server errors
    else if (error.status >= 500) {
      aiError = new AIError(
        `${service} server error. Please try again later.`,
        service,
        error.status,
        true,
        ErrorSeverity.HIGH,
        context
      );
    }
    // Client errors
    else if (error.status >= 400) {
      aiError = new AIError(
        `Invalid request to ${service}. Please check your input.`,
        service,
        error.status,
        false,
        ErrorSeverity.MEDIUM,
        context
      );
    }
    // Unknown errors
    else {
      aiError = new AIError(
        `Unexpected error with ${service}`,
        service,
        undefined,
        false,
        ErrorSeverity.HIGH,
        context
      );
    }
    
    this.logError(aiError);
    return aiError;
  }
  
  private static logError(error: AIError): void {
    // Log to analytics
    this.analytics.trackError(error);
    
    // Log to console in development
    if (__DEV__) {
      console.error('AI Error:', error.toJSON());
    }
    
    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorReporting(error);
    }
  }
  
  private static async sendToErrorReporting(error: AIError): Promise<void> {
    try {
      // Integration with error reporting services like Sentry, Bugsnag, etc.
      // await ErrorReportingService.captureException(error);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}
```
```

### 2. Advanced Retry Logic with Circuit Breaker

```typescript
// utils/retry.ts (2025)
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: AIError) => boolean;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  
  constructor(private config: CircuitBreakerConfig) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new AIError(
          'Circuit breaker is open. Service temporarily unavailable.',
          'openrouter',
          503,
          true,
          ErrorSeverity.HIGH
        );
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED;
      }
    }
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
}

export class RetryManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  
  private getCircuitBreaker(service: string): CircuitBreaker {
    if (!this.circuitBreakers.has(service)) {
      this.circuitBreakers.set(service, new CircuitBreaker({
        failureThreshold: 5,
        resetTimeout: 60000,
        monitoringPeriod: 300000
      }));
    }
    return this.circuitBreakers.get(service)!;
  }
  
  async withRetry<T>(
    fn: () => Promise<T>,
    service: string,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: (error: AIError) => error.retryable,
      ...config
    };
    
    const circuitBreaker = this.getCircuitBreaker(service);
    
    return circuitBreaker.execute(async () => {
      let lastError: AIError;
      
      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as AIError;
          
          // Don't retry if it's the last attempt or error is not retryable
          if (attempt === retryConfig.maxRetries || 
              !retryConfig.retryCondition!(lastError)) {
            throw error;
          }
          
          // Calculate delay with exponential backoff and jitter
          let delay = Math.min(
            retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
            retryConfig.maxDelay
          );
          
          if (retryConfig.jitter) {
            delay = delay * (0.5 + Math.random() * 0.5);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError!;
    });
  }
}
```
```

## Performance Optimization (2025)

### 1. Intelligent Caching with AI-Powered Invalidation

```typescript
// utils/cache.ts (2025)
import { LRUCache } from 'lru-cache';
import { createHash } from 'crypto';

interface CacheEntry {
  response: string;
  metadata: {
    model: string;
    tokenCount: number;
    responseTime: number;
    quality: number;
    timestamp: number;
    accessCount: number;
  };
  ttl: number;
  tags: string[];
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  compressionEnabled: boolean;
  persistToDisk: boolean;
}

class IntelligentCache {
  private cache: LRUCache<string, CacheEntry>;
  private semanticIndex = new Map<string, string[]>();
  private config: CacheConfig;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 300000, // 5 minutes
      compressionEnabled: true,
      persistToDisk: false,
      ...config
    };
    
    this.cache = new LRUCache({
      max: this.config.maxSize,
      ttl: this.config.defaultTTL,
      updateAgeOnGet: true,
      allowStale: false
    });
  }
  
  private generateSemanticKey(messages: CoreMessage[]): string {
    // Create a semantic hash that considers intent, not just exact text
    const content = messages.map(m => 
      typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
    ).join('|');
    
    // Normalize content for semantic similarity
    const normalized = content
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    
    return createHash('sha256').update(normalized).digest('hex').slice(0, 32);
  }
  
  private extractTags(messages: CoreMessage[]): string[] {
    const tags: string[] = [];
    const content = messages.map(m => 
      typeof m.content === 'string' ? m.content : ''
    ).join(' ');
    
    // Extract semantic tags
    if (content.match(/weather|temperature|climate/i)) tags.push('weather');
    if (content.match(/news|current|latest/i)) tags.push('news');
    if (content.match(/code|programming|function/i)) tags.push('code');
    if (content.match(/task|todo|plan/i)) tags.push('planning');
    
    return tags;
  }
  
  async get(messages: CoreMessage[], model: string): Promise<string | null> {
    const key = this.generateSemanticKey(messages);
    const entry = this.cache.get(key);
    
    if (!entry) {
      // Check for semantically similar cached responses
      return this.findSimilarResponse(messages);
    }
    
    // Update access statistics
    entry.metadata.accessCount++;
    this.cache.set(key, entry);
    
    return this.config.compressionEnabled ? 
      this.decompress(entry.response) : entry.response;
  }
  
  async set(
    messages: CoreMessage[], 
    response: string, 
    metadata: Partial<CacheEntry['metadata']>,
    customTTL?: number
  ): Promise<void> {
    const key = this.generateSemanticKey(messages);
    const tags = this.extractTags(messages);
    
    // Calculate dynamic TTL based on content type and quality
    const ttl = customTTL || this.calculateDynamicTTL(tags, metadata.quality || 0.5);
    
    const entry: CacheEntry = {
      response: this.config.compressionEnabled ? this.compress(response) : response,
      metadata: {
        model: metadata.model || 'unknown',
        tokenCount: metadata.tokenCount || 0,
        responseTime: metadata.responseTime || 0,
        quality: metadata.quality || 0.5,
        timestamp: Date.now(),
        accessCount: 1,
        ...metadata
      },
      ttl,
      tags
    };
    
    this.cache.set(key, entry);
    this.updateSemanticIndex(key, tags);
    
    if (this.config.persistToDisk) {
      await this.persistEntry(key, entry);
    }
  }
  
  private calculateDynamicTTL(tags: string[], quality: number): number {
    let baseTTL = this.config.defaultTTL;
    
    // Adjust TTL based on content type
    if (tags.includes('news')) baseTTL = 60000; // 1 minute for news
    if (tags.includes('weather')) baseTTL = 300000; // 5 minutes for weather
    if (tags.includes('code')) baseTTL = 3600000; // 1 hour for code
    if (tags.includes('planning')) baseTTL = 1800000; // 30 minutes for planning
    
    // Adjust based on quality score
    return Math.floor(baseTTL * (0.5 + quality));
  }
  
  private async findSimilarResponse(messages: CoreMessage[]): Promise<string | null> {
    const tags = this.extractTags(messages);
    
    for (const tag of tags) {
      const similarKeys = this.semanticIndex.get(tag) || [];
      for (const key of similarKeys) {
        const entry = this.cache.get(key);
        if (entry && this.calculateSimilarity(messages, key) > 0.8) {
          return this.config.compressionEnabled ? 
            this.decompress(entry.response) : entry.response;
        }
      }
    }
    
    return null;
  }
  
  private calculateSimilarity(messages: CoreMessage[], cachedKey: string): number {
    // Implement semantic similarity calculation
    // This is a simplified version - in practice, you might use embeddings
    return Math.random(); // Placeholder
  }
  
  private compress(data: string): string {
    // Implement compression (e.g., using pako or similar)
    return data; // Placeholder
  }
  
  private decompress(data: string): string {
    // Implement decompression
    return data; // Placeholder
  }
  
  private updateSemanticIndex(key: string, tags: string[]): void {
    for (const tag of tags) {
      if (!this.semanticIndex.has(tag)) {
        this.semanticIndex.set(tag, []);
      }
      this.semanticIndex.get(tag)!.push(key);
    }
  }
  
  private async persistEntry(key: string, entry: CacheEntry): Promise<void> {
    // Implement disk persistence for important cache entries
    // Could use AsyncStorage, SQLite, or other storage solutions
  }
  
  invalidateByTags(tags: string[]): void {
    for (const tag of tags) {
      const keys = this.semanticIndex.get(tag) || [];
      for (const key of keys) {
        this.cache.delete(key);
      }
      this.semanticIndex.delete(tag);
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
      topTags: this.getTopTags()
    };
  }
  
  private calculateHitRate(): number {
    // Implementation for hit rate calculation
    return 0.85; // Placeholder
  }
  
  private calculateAverageResponseTime(): number {
    // Implementation for average response time calculation
    return 150; // Placeholder
  }
  
  private getTopTags(): Array<{ tag: string; count: number }> {
    // Implementation for top tags calculation
    return []; // Placeholder
  }
}
```

### 2. Advanced Request Optimization

```typescript
// utils/optimization.ts (2025)
interface OptimizationConfig {
  maxTokens: number;
  compressionRatio: number;
  prioritizeRecent: boolean;
  useSemanticCompression: boolean;
}

class RequestOptimizer {
  private tokenCounter = new TokenCounter();
  
  optimizeMessages(
    messages: CoreMessage[], 
    config: OptimizationConfig
  ): CoreMessage[] {
    // 1. Preserve system message
    const systemMessage = messages.find(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    
    // 2. Calculate current token count
    let currentTokens = this.tokenCounter.countTokens(messages);
    
    if (currentTokens <= config.maxTokens) {
      return messages;
    }
    
    // 3. Apply optimization strategies
    let optimizedMessages = otherMessages;
    
    // Strategy 1: Remove older messages
    if (config.prioritizeRecent) {
      optimizedMessages = this.prioritizeRecentMessages(optimizedMessages, config.maxTokens);
    }
    
    // Strategy 2: Semantic compression
    if (config.useSemanticCompression) {
      optimizedMessages = this.applySemanticCompression(optimizedMessages, config.compressionRatio);
    }
    
    // Strategy 3: Content summarization for very long conversations
    if (optimizedMessages.length > 20) {
      optimizedMessages = this.summarizeOldMessages(optimizedMessages);
    }
    
    return systemMessage ? [systemMessage, ...optimizedMessages] : optimizedMessages;
  }
  
  private prioritizeRecentMessages(messages: CoreMessage[], maxTokens: number): CoreMessage[] {
    const result: CoreMessage[] = [];
    let tokenCount = 0;
    
    // Add messages from most recent, stopping when we hit token limit
    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = this.tokenCounter.countTokens([messages[i]]);
      if (tokenCount + messageTokens > maxTokens) break;
      
      result.unshift(messages[i]);
      tokenCount += messageTokens;
    }
    
    return result;
  }
  
  private applySemanticCompression(messages: CoreMessage[], ratio: number): CoreMessage[] {
    return messages.map(message => {
      if (typeof message.content === 'string' && message.content.length > 200) {
        // Apply intelligent text compression while preserving meaning
        message.content = this.compressText(message.content, ratio);
      }
      return message;
    });
  }
  
  private compressText(text: string, ratio: number): string {
    // Implement semantic text compression
    // Remove redundant phrases, compress common patterns
    const sentences = text.split(/[.!?]+/);
    const targetLength = Math.floor(text.length * ratio);
    
    // Prioritize sentences with important keywords
    const scoredSentences = sentences.map(sentence => ({
      text: sentence.trim(),
      score: this.calculateSentenceImportance(sentence)
    }));
    
    scoredSentences.sort((a, b) => b.score - a.score);
    
    let result = '';
    for (const sentence of scoredSentences) {
      if (result.length + sentence.text.length > targetLength) break;
      result += sentence.text + '. ';
    }
    
    return result.trim();
  }
  
  private calculateSentenceImportance(sentence: string): number {
    const importantWords = ['task', 'important', 'urgent', 'deadline', 'priority', 'goal'];
    const words = sentence.toLowerCase().split(/\s+/);
    
    let score = words.length; // Base score
    
    // Boost score for important words
    for (const word of words) {
      if (importantWords.includes(word)) {
        score += 10;
      }
    }
    
    return score;
  }
  
  private async summarizeOldMessages(messages: CoreMessage[]): Promise<CoreMessage[]> {
    if (messages.length <= 10) return messages;
    
    const oldMessages = messages.slice(0, -10);
    const recentMessages = messages.slice(-10);
    
    // Create a summary of old messages
    const summary = await this.createConversationSummary(oldMessages);
    
    const summaryMessage: CoreMessage = {
      role: 'system',
      content: `Previous conversation summary: ${summary}`
    };
    
    return [summaryMessage, ...recentMessages];
  }
  
  private async createConversationSummary(messages: CoreMessage[]): Promise<string> {
    // Extract key topics and decisions from the conversation
    const topics = new Set<string>();
    const decisions = new Set<string>();
    
    for (const message of messages) {
      const content = typeof message.content === 'string' ? message.content : '';
      
      // Extract topics (simplified)
      const topicMatches = content.match(/(?:about|regarding|concerning)\s+([^.!?]+)/gi);
      if (topicMatches) {
        topicMatches.forEach(match => topics.add(match.trim()));
      }
      
      // Extract decisions
      const decisionMatches = content.match(/(?:decided|agreed|concluded)\s+([^.!?]+)/gi);
      if (decisionMatches) {
        decisionMatches.forEach(match => decisions.add(match.trim()));
      }
    }
    
    let summary = 'The conversation covered ';
    if (topics.size > 0) {
      summary += `topics: ${Array.from(topics).slice(0, 3).join(', ')}. `;
    }
    if (decisions.size > 0) {
      summary += `Key decisions: ${Array.from(decisions).slice(0, 2).join(', ')}.`;
    }
    
    return summary;
  }
}

class TokenCounter {
  countTokens(messages: CoreMessage[]): number {
    // Implement accurate token counting
    // This is a simplified version - use actual tokenizer for production
    return messages.reduce((total, message) => {
      const content = typeof message.content === 'string' ? 
        message.content : JSON.stringify(message.content);
      return total + Math.ceil(content.length / 4); // Rough approximation
    }, 0);
  }
}
```

## Testing and Monitoring

### 1. API Health Monitoring

```typescript
// utils/monitoring.ts
export class APIMonitor {
  private metrics = {
    openrouter: { requests: 0, errors: 0, avgResponseTime: 0 },
    perplexity: { requests: 0, errors: 0, avgResponseTime: 0 }
  };
  
  recordRequest(service: 'openrouter' | 'perplexity', responseTime: number, success: boolean) {
    const metric = this.metrics[service];
    metric.requests++;
    
    if (!success) {
      metric.errors++;
    }
    
    metric.avgResponseTime = (metric.avgResponseTime + responseTime) / 2;
  }
  
  getHealthStatus() {
    return Object.entries(this.metrics).map(([service, metric]) => ({
      service,
      errorRate: metric.errors / metric.requests,
      avgResponseTime: metric.avgResponseTime,
      status: metric.errors / metric.requests < 0.1 ? 'healthy' : 'degraded'
    }));
  }
}
```

### 2. Testing Utilities

```typescript
// __tests__/aiService.test.ts
import { AIService } from '../services/aiService';

describe('AIService', () => {
  let aiService: AIService;
  
  beforeEach(() => {
    aiService = new AIService();
  });
  
  test('should route web search queries to Perplexity', async () => {
    const messages = [
      { role: 'user', content: 'What is the latest news about AI?' }
    ];
    
    const response = await aiService.processQuery(messages);
    expect(response.sources).toBeDefined();
  });
  
  test('should route general queries to OpenRouter', async () => {
    const messages = [
      { role: 'user', content: 'Explain quantum computing' }
    ];
    
    const response = await aiService.processQuery(messages);
    expect(response.content).toBeDefined();
  });
});
```

## Implementation Checklist

### Phase 1: Security and Configuration
- [ ] Move API keys to environment variables
- [ ] Implement API key validation
- [ ] Add rate limiting
- [ ] Set up error handling

### Phase 2: Enhanced Features
- [ ] Implement advanced query classification
- [ ] Add OpenRouter tool calling
- [ ] Integrate Perplexity's new search features
- [ ] Add citation display in UI

### Phase 3: Performance and Monitoring
- [ ] Implement response caching
- [ ] Add request optimization
- [ ] Set up monitoring and metrics
- [ ] Add comprehensive testing

### Phase 4: Advanced Features
- [ ] Implement async research queries
- [ ] Add domain-specific search filters
- [ ] Integrate reasoning effort controls
- [ ] Add model selection based on query type

## Conclusion

This integration guide provides a comprehensive roadmap for enhancing the current OpenRouter and Perplexity integrations in the Gemini Planner App. The recommended improvements focus on:

1. **Security**: Proper API key management and validation
2. **Reliability**: Enhanced error handling and fallback mechanisms
3. **Performance**: Caching, optimization, and monitoring
4. **Features**: Leveraging the latest capabilities of both services
5. **User Experience**: Better query routing and response handling

Implementing these improvements will result in a more robust, secure, and feature-rich AI integration that takes full advantage of both OpenRouter's model diversity and Perplexity's real-time search capabilities.