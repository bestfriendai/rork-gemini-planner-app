import { CoreMessage, Task } from '@/types';
import { aiPerformance } from '@/utils/aiPerformance';
import { API_CONFIG, validateApiKeys } from '@/utils/config';
import { extractTasksFromAIResponse } from '@/utils/aiUtils';

// Enhanced query classification
interface QueryClassification {
  needsWebSearch: boolean;
  queryType: 'general' | 'creative' | 'analytical' | 'research' | 'news';
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
}

// Model configuration for different query types
interface ModelConfig {
  primary: string;
  fallback: string[];
  maxTokens: number;
  temperature: number;
  reasoning?: 'fast' | 'balanced' | 'thorough';
}

// Perplexity configuration for different query types
interface PerplexityConfig {
  model: string;
  searchMode?: 'web' | 'academic';
  reasoningEffort?: 'low' | 'medium' | 'high';
  maxSources?: number;
}

// Enhanced error handling
class AIError extends Error {
  constructor(
    message: string,
    public service: 'openrouter' | 'perplexity',
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * AIService provides a unified interface for interacting with AI services
 * with performance monitoring, caching, and intelligent routing
 */
export class AIService {
  private MODEL_CONFIGS: Record<string, ModelConfig> = {
    'general': {
      primary: 'google/gemini-flash-1.5',
      fallback: ['openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
      maxTokens: 2000,
      temperature: 0.7,
      reasoning: 'balanced'
    },
    'creative': {
      primary: 'anthropic/claude-3-sonnet',
      fallback: ['openai/gpt-4o', 'google/gemini-2.5-flash'],
      maxTokens: 3000,
      temperature: 0.9,
      reasoning: 'fast'
    },
    'analytical': {
      primary: 'openai/gpt-4o',
      fallback: ['anthropic/claude-3-opus', 'google/gemini-2.5-flash'],
      maxTokens: 2500,
      temperature: 0.3,
      reasoning: 'thorough'
    },
    'research': {
      primary: 'anthropic/claude-3-sonnet',
      fallback: ['openai/gpt-4o', 'google/gemini-2.5-flash'],
      maxTokens: 3000,
      temperature: 0.5,
      reasoning: 'thorough'
    },
    'news': {
      primary: 'sonar',
      fallback: ['sonar-pro'],
      maxTokens: 2000,
      temperature: 0.7,
      reasoning: 'balanced'
    }
  };

  constructor() {
    // Validate API keys on initialization
    validateApiKeys();
  }

  /**
   * Process a query using the most appropriate AI service
   */
  async processQuery(
    messages: CoreMessage[],
    onStream?: (chunk: string) => void,
    options: {
      bypassCache?: boolean;
      forceService?: 'openrouter' | 'perplexity';
    } = {}
  ): Promise<string> {
    try {
      const currentDateTime = this.getCurrentDateTime();
      const lastMessage = messages[messages.length - 1];
      const userQuery = typeof lastMessage.content === 'string' ? lastMessage.content : '';
      
      // Classify the query to determine the best approach
      const classification = this.classifyQuery(userQuery);
      
      // Use optimizeRequest to potentially use cached responses
      return await aiPerformance.optimizeRequest<string>(
        messages,
        async () => {
          if (options.forceService === 'perplexity' || 
              (classification.needsWebSearch && !options.forceService)) {
            return await this.withRetry(() => 
              this.callPerplexityAI(messages, currentDateTime, classification, onStream)
            );
          } else {
            return await this.withRetry(() => 
              this.callOpenRouterAI(messages, currentDateTime, classification, onStream)
            );
          }
        },
        {
          bypassCache: options.bypassCache,
          model: classification.queryType,
          ttl: this.calculateCacheTTL(classification)
        }
      );
    } catch (error) {
      console.error('Error calling AI:', error);
      
      if (error instanceof AIError) {
        return `I apologize, but I'm experiencing some technical difficulties: ${error.message}`;
      }
      
      return "I apologize, but I'm having trouble connecting to my AI services right now. This could be due to network issues or temporary service unavailability. Please check your internet connection and try again in a moment.";
    }
  }

  /**
   * Extract tasks from an AI response
   */
  extractTasks(text: string): Task[] {
    return extractTasksFromAIResponse(text);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return aiPerformance.getStats();
  }

  /**
   * Invalidate cache for specific query types
   */
  invalidateCache(tags: string[]) {
    aiPerformance.invalidateCache(tags);
  }

  /**
   * Clear all performance metrics
   */
  clearMetrics() {
    aiPerformance.clearMetrics();
  }

  /**
   * Calculate appropriate cache TTL based on query classification
   */
  private calculateCacheTTL(classification: QueryClassification): number {
    if (classification.needsWebSearch) {
      // Web search results expire quickly
      return 1000 * 60 * 30; // 30 minutes
    }
    
    if (classification.queryType === 'news') {
      return 1000 * 60 * 60; // 1 hour
    }
    
    if (classification.urgency === 'high') {
      return 1000 * 60 * 60 * 2; // 2 hours
    }
    
    // Default TTL for general queries
    return 1000 * 60 * 60 * 24; // 24 hours
  }

  /**
   * Call OpenRouter API with performance monitoring
   */
  private async callOpenRouterAI(
    messages: CoreMessage[], 
    currentDateTime: any,
    classification: QueryClassification,
    onStream?: (chunk: string) => void
  ): Promise<string> {
    const requestTracker = aiPerformance.startRequest('openrouter');
    
    try {
      const config = this.MODEL_CONFIGS[classification.queryType] || this.MODEL_CONFIGS['general'];
      
      // Add current date/time context to system message
      const enhancedMessages = messages.map((msg, index) => {
        if (index === 0 && msg.role === 'system') {
          return {
            ...msg,
            content: `${msg.content}

CURRENT DATE & TIME CONTEXT:
- Today is: ${currentDateTime.date}
- Current time: ${currentDateTime.time}
- Timezone: ${currentDateTime.timezone}
- ISO Date: ${currentDateTime.isoDate}

Query Classification: ${classification.queryType} (${classification.complexity} complexity, ${classification.urgency} urgency)

When users ask about "today", "now", "current time", etc., use this information.`
          };
        }
        return msg;
      });

      const requestBody = {
        model: config.primary,
        messages: enhancedMessages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: false
      };

      const response = await fetch(API_CONFIG.openrouter.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.openrouter.apiKey}`,
          'HTTP-Referer': 'https://expo.dev',
          'X-Title': 'Jarva Assistant App',
          'OR-Site-URL': 'https://expo.dev',
          'OR-App-Name': 'Jarva Assistant'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          model: config.primary,
          url: response.url
        });
        
        requestTracker.error('api_error');
        throw this.handleAIError({ status: response.status, message: errorText }, 'openrouter');
      }

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        const content = data.choices?.[0]?.message?.content || 'No response received from AI service';
        
        // Track token usage if available
        const tokenCount = data.usage?.total_tokens;
        requestTracker.complete(tokenCount);
        
        return content;
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', { 
          error: jsonError, 
          responseText: responseText.substring(0, 200),
          status: response.status
        });
        
        requestTracker.error('json_parse_error');
        throw new AIError(`Invalid JSON response: ${jsonError}`, 'openrouter');
      }
    } catch (error) {
      console.error('OpenRouter AI error:', error);
      requestTracker.error(error instanceof Error ? error.message : 'unknown');
      throw this.handleAIError(error, 'openrouter');
    }
  }

  /**
   * Call Perplexity API with performance monitoring
   */
  private async callPerplexityAI(
    messages: CoreMessage[], 
    currentDateTime: any,
    classification: QueryClassification,
    onStream?: (chunk: string) => void
  ): Promise<string> {
    const requestTracker = aiPerformance.startRequest('perplexity');
    
    try {
      const config = this.getPerplexityConfig(typeof messages[messages.length - 1].content === 'string' ? 
        messages[messages.length - 1].content as string : '');
      
      // Prepare messages for Perplexity - use only the last user message and system message
      const systemMessage = messages.find(msg => msg.role === 'system');
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      
      if (!lastUserMessage) {
        requestTracker.error('no_user_message');
        throw new AIError('No user message found', 'perplexity');
      }

      const perplexityMessages: CoreMessage[] = [];
      
      if (systemMessage) {
        perplexityMessages.push({
          role: 'system',
          content: `You are Jarva, a helpful AI assistant with access to current web information. Provide accurate, up-to-date answers based on your search results.

CURRENT DATE & TIME CONTEXT:
- Today is: ${currentDateTime.date}
- Current time: ${currentDateTime.time}
- Timezone: ${currentDateTime.timezone}
- ISO Date: ${currentDateTime.isoDate}

Query Type: ${classification.queryType}
Search Mode: ${config.searchMode}

Use web search to provide current, accurate information. Always cite your sources when possible.`
        });
      }
      
      perplexityMessages.push(lastUserMessage);

      const requestBody: any = {
        model: config.model,
        messages: perplexityMessages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: false
      };

      // Add search-specific parameters if available
      if (config.searchMode) {
        requestBody.search_mode = config.searchMode;
      }
      
      if (config.reasoningEffort) {
        requestBody.reasoning_effort = config.reasoningEffort;
      }

      const response = await fetch(API_CONFIG.perplexity.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
          'User-Agent': 'Jarva-Assistant/1.0'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Perplexity API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          model: config.model,
          url: response.url
        });
        
        requestTracker.error('api_error');
        
        // Fallback to OpenRouter if Perplexity fails
        console.log('Falling back to OpenRouter AI due to Perplexity error...');
        return await this.callOpenRouterAI(messages, currentDateTime, classification, onStream);
      }

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        const content = data.choices?.[0]?.message?.content || 'No response received from search service';
        
        // Track token usage if available
        const tokenCount = data.usage?.total_tokens;
        requestTracker.complete(tokenCount);
        
        // Add source information if available
        if (data.search_results && data.search_results.length > 0) {
          const sources = data.search_results.slice(0, 3).map((result: any, index: number) => 
            `[${index + 1}] ${result.title} - ${result.url}`
          ).join('\n');
          
          return `${content}\n\n**Sources:**\n${sources}`;
        }
        
        return content;
      } catch (jsonError) {
        console.error('Failed to parse Perplexity JSON response:', { 
          error: jsonError, 
          responseText: responseText.substring(0, 200),
          status: response.status
        });
        
        requestTracker.error('json_parse_error');
        throw new AIError(`Invalid JSON response from Perplexity: ${jsonError}`, 'perplexity');
      }
    } catch (error) {
      console.error('Perplexity AI error:', error);
      requestTracker.error(error instanceof Error ? error.message : 'unknown');
      
      if (error instanceof AIError && error.service === 'perplexity') {
        // Fallback to OpenRouter if Perplexity fails
        console.log('Falling back to OpenRouter AI due to error...');
        return await this.callOpenRouterAI(messages, currentDateTime, classification, onStream);
      }
      
      throw this.handleAIError(error, 'perplexity');
    }
  }

  /**
   * Get current date and time for context
   */
  private getCurrentDateTime() {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isoDate: now.toISOString().split('T')[0],
      isoDateTime: now.toISOString(),
    };
  }

  /**
   * Classify a query to determine the best approach
   */
  private classifyQuery(query: string): QueryClassification {
    const webSearchKeywords = [
      'current', 'latest', 'recent', 'today', 'news', 'weather', 'stock', 'price',
      'what is happening', 'what happened', 'search for', 'find information',
      'look up', 'trending', 'popular', 'viral', 'breaking', 'update', 'live', 'now',
      'cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'market', 'exchange rate',
      'real-time', 'current events', 'happening now'
    ];
    
    const creativeKeywords = [
      'write', 'create', 'generate', 'story', 'poem', 'creative', 'imagine', 'design'
    ];
    
    const analyticalKeywords = [
      'analyze', 'compare', 'evaluate', 'calculate', 'solve', 'explain', 'breakdown'
    ];
    
    const researchKeywords = [
      'research', 'study', 'investigate', 'explore', 'academic', 'scientific', 'paper'
    ];

    const needsWebSearch = webSearchKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
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
  }

  /**
   * Get Perplexity configuration based on query
   */
  private getPerplexityConfig(query: string): PerplexityConfig {
    // Academic queries
    if (query.match(/research|study|paper|academic|scientific|journal/i)) {
      return {
        model: 'sonar',
        searchMode: 'academic',
        reasoningEffort: 'high',
        maxSources: 8
      };
    }
    
    // Breaking news and current events
    if (query.match(/news|breaking|latest|current|today|happening|live/i)) {
      return {
        model: 'sonar',
        searchMode: 'web',
        reasoningEffort: 'medium',
        maxSources: 6
      };
    }
    
    // Social media and trending topics
    if (query.match(/trending|viral|social|twitter|reddit|discussion/i)) {
      return {
        model: 'sonar',
        searchMode: 'web',
        reasoningEffort: 'medium',
        maxSources: 8
      };
    }
    
    // Default configuration for general queries
    return {
      model: 'sonar',
      searchMode: 'web',
      reasoningEffort: 'medium',
      maxSources: 6
    };
  }

  /**
   * Handle AI errors with detailed information
   */
  private handleAIError(error: any, service: 'openrouter' | 'perplexity'): AIError {
    if (error instanceof AIError) {
      return error;
    }
    
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new AIError(
        'Network connection failed. Please check your internet connection.',
        service,
        undefined,
        true
      );
    }
    
    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new AIError(
        'Request timed out. The service may be experiencing high load.',
        service,
        408,
        true
      );
    }
    
    // Rate limiting
    if (error.status === 429) {
      return new AIError(
        'Rate limit exceeded. Please wait before making another request.',
        service,
        429,
        true
      );
    }
    
    // Authentication errors
    if (error.status === 401 || error.status === 403) {
      return new AIError(
        'Authentication failed. Please check your API key configuration.',
        service,
        error.status,
        false
      );
    }
    
    // Server errors
    if (error.status >= 500) {
      return new AIError(
        `${service} server error. Please try again later.`,
        service,
        error.status,
        true
      );
    }
    
    // Client errors
    if (error.status >= 400) {
      return new AIError(
        `Invalid request to ${service}. Please check your input.`,
        service,
        error.status,
        false
      );
    }
    
    return new AIError(
      `Unexpected error with ${service}: ${error.message}`,
      service,
      undefined,
      false
    );
  }

  /**
   * Retry logic with exponential backoff
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        const aiError = error as AIError;
        
        if (i === maxRetries || !aiError.retryable) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

// Export a singleton instance
export const aiService = new AIService();