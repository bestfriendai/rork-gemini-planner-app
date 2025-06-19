import { CoreMessage } from '@/types';
import { API_CONFIG, APP_CONFIG } from './config';
import { rateLimiter } from './rateLimiter';
import { apiMonitor } from './monitoring';
import { responseCache } from './cache';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class AIError extends Error {
  public readonly timestamp: Date;
  public readonly errorId: string;
  
  constructor(
    message: string,
    public service: 'openrouter' | 'perplexity',
    public statusCode?: number,
    public retryable: boolean = false,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ) {
    super(message);
    this.name = 'AIError';
    this.timestamp = new Date();
    this.errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

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
    primary: 'google/gemini-2.5-flash-lite-preview-06-17',
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

interface PerplexityConfig {
  model: 'llama-3.1-sonar-small-128k-online' | 'llama-3.1-sonar-large-128k-online' | 'llama-3.1-sonar-huge-128k-online';
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
  if (query.match(/code|programming|github|repository|function|class|api/i)) {
    return {
      model: 'llama-3.1-sonar-large-128k-online',
      searchMode: 'code',
      reasoningEffort: 'thorough',
      searchContextSize: 'extended',
      maxSources: 8
    };
  }
  
  if (query.match(/research|study|paper|academic|scientific|journal/i)) {
    return {
      model: 'llama-3.1-sonar-large-128k-online',
      searchMode: 'academic',
      reasoningEffort: 'thorough',
      searchContextSize: 'comprehensive',
      factCheck: true,
      citationValidation: true,
      maxSources: 12
    };
  }
  
  if (query.match(/news|breaking|latest|current|today|happening|live/i)) {
    return {
      model: 'llama-3.1-sonar-small-128k-online',
      searchMode: 'news',
      reasoningEffort: 'fast',
      searchContextSize: 'standard',
      dateFilter: 'day',
      factCheck: true,
      maxSources: 6
    };
  }
  
  if (query.length > 150 || query.match(/analyze|compare|evaluate|comprehensive|detailed/i)) {
    return {
      model: 'llama-3.1-sonar-huge-128k-online',
      reasoningEffort: 'adaptive',
      searchContextSize: 'comprehensive',
      factCheck: true,
      citationValidation: true,
      maxSources: 15
    };
  }
  
  if (query.match(/trending|viral|social|twitter|reddit|discussion/i)) {
    return {
      model: 'llama-3.1-sonar-large-128k-online',
      searchMode: 'social',
      reasoningEffort: 'balanced',
      searchContextSize: 'standard',
      dateFilter: 'week',
      maxSources: 8
    };
  }
  
  return {
    model: 'llama-3.1-sonar-small-128k-online',
    searchMode: 'web',
    reasoningEffort: 'balanced',
    searchContextSize: 'standard',
    maxSources: 6
  };
};

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

export const callGeminiAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  console.log('=== OpenRouter API Call ===');
  console.log('API Key:', API_CONFIG.openrouter.apiKey ? `${API_CONFIG.openrouter.apiKey.substring(0, 15)}...` : 'NOT SET');
  
  if (!API_CONFIG.openrouter.apiKey) {
    throw new AIError(
      'OpenRouter API key is not configured. Please check your app configuration.',
      'openrouter',
      401,
      false,
      ErrorSeverity.CRITICAL
    );
  }

  if (!rateLimiter.canMakeRequest('openrouter')) {
    throw new AIError(
      'Rate limit exceeded for OpenRouter API. Please try again later.',
      'openrouter',
      429,
      true,
      ErrorSeverity.LOW
    );
  }

  const startTime = Date.now();
  try {
    const lastMessage = messages[messages.length - 1];
    const query = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    const classification = classifyQuery(query);
    const config = MODEL_CONFIGS[classification.queryType] || MODEL_CONFIGS['general'];

    const enhancedMessages = messages.map(msg => ({ ...msg }));

    console.log('Making request to OpenRouter with model:', config.primary);

    const response = await fetch(`${API_CONFIG.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.openrouter.apiKey}`,
        'HTTP-Referer': 'https://expo.dev',
        'X-Title': APP_CONFIG.name,
      },
      body: JSON.stringify({
        model: config.primary,
        models: [config.primary, ...config.fallback],
        messages: enhancedMessages,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        tools: config.useTools ? TASK_TOOLS : undefined,
        provider: { allow_fallbacks: true, require_parameters: true, data_collection: 'deny' },
        route: 'fallback',
        stream: !!onStream,
      }),
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new AIError(
        `OpenRouter API error: ${errorText}`,
        'openrouter',
        response.status,
        response.status >= 500 || response.status === 429,
        response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
      );
    }

    const endTime = Date.now();
    apiMonitor.recordRequest('openrouter', endTime - startTime, true);

    if (onStream) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new AIError(
          'Streaming not supported or response body is empty',
          'openrouter',
          undefined,
          true,
          ErrorSeverity.MEDIUM
        );
      }

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') {
              onStream('');
              break;
            }
            try {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                result += content;
                onStream(content);
              }
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
        }
      }
      return result;
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      responseCache.set(messages, content, 300000, {
        model: config.primary,
        tokenCount: data.usage?.total_tokens,
        responseTime: endTime - startTime
      });
      return content;
    }
  } catch (error) {
    const endTime = Date.now();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    apiMonitor.recordRequest('openrouter', endTime - startTime, false, errorMessage);
    if (error instanceof AIError) {
      throw error;
    }
    throw new AIError(
      `Network error: ${errorMessage}`,
      'openrouter',
      undefined,
      true,
      ErrorSeverity.HIGH
    );
  }
};

export const callPerplexityAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  console.log('=== Perplexity API Call ===');
  console.log('API Key:', API_CONFIG.perplexity.apiKey ? `${API_CONFIG.perplexity.apiKey.substring(0, 15)}...` : 'NOT SET');
  
  if (!API_CONFIG.perplexity.apiKey) {
    throw new AIError(
      'Perplexity API key is not configured. Please check your app configuration.',
      'perplexity',
      401,
      false,
      ErrorSeverity.CRITICAL
    );
  }

  if (!rateLimiter.canMakeRequest('perplexity')) {
    throw new AIError(
      'Rate limit exceeded for Perplexity API. Please try again later.',
      'perplexity',
      429,
      true,
      ErrorSeverity.LOW
    );
  }

  const startTime = Date.now();
  try {
    const lastMessage = messages[messages.length - 1];
    const query = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    const config = getPerplexityConfig(query);

    const requestBody: any = {
      model: config.model,
      messages,
      max_tokens: config.model === 'llama-3.1-sonar-huge-128k-online' ? 2000 : 1000,
      temperature: 0.7,
      stream: !!onStream
    };

    console.log('Making request to Perplexity with model:', config.model);

    const response = await fetch(`${API_CONFIG.perplexity.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.perplexity.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Perplexity response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      throw new AIError(
        `Perplexity API error: ${errorText}`,
        'perplexity',
        response.status,
        response.status >= 500 || response.status === 429,
        response.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
      );
    }

    const endTime = Date.now();
    apiMonitor.recordRequest('perplexity', endTime - startTime, true);

    if (onStream) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new AIError(
          'Streaming not supported or response body is empty',
          'perplexity',
          undefined,
          true,
          ErrorSeverity.MEDIUM
        );
      }

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') {
              onStream('');
              break;
            }
            try {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                result += content;
                onStream(content);
              }
            } catch (e) {
              console.error('JSON parse error:', e);
            }
          }
        }
      }
      return result;
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      responseCache.set(messages, content, 300000, {
        model: config.model,
        responseTime: endTime - startTime
      });
      return content;
    }
  } catch (error) {
    const endTime = Date.now();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    apiMonitor.recordRequest('perplexity', endTime - startTime, false, errorMessage);
    if (error instanceof AIError) {
      throw error;
    }
    throw new AIError(
      `Network error: ${errorMessage}`,
      'perplexity',
      undefined,
      true,
      ErrorSeverity.HIGH
    );
  }
};

export const processAIRequest = async (
  messages: CoreMessage[],
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  const lastMessage = messages[messages.length - 1];
  const query = typeof lastMessage.content === 'string' ? lastMessage.content : '';
  const classification = classifyQuery(query);
  
  console.log('=== Processing AI Request ===');
  console.log('Query:', query.substring(0, 100) + '...');
  console.log('Classification:', classification);
  
  try {
    if (classification.needsWebSearch) {
      console.log('Using Perplexity for web search');
      return await callPerplexityAI(messages, currentDateTime, onStream);
    } else {
      console.log('Using OpenRouter for general query');
      return await callGeminiAI(messages, currentDateTime, onStream);
    }
  } catch (error) {
    console.error('Primary AI service failed:', error);
    if (classification.needsWebSearch && error instanceof AIError && error.retryable) {
      console.log('Falling back to Gemini AI after Perplexity error');
      return await callGeminiAI(messages, currentDateTime, onStream);
    }
    throw error;
  }
};