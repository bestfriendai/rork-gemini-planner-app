import { CoreMessage, Task } from '@/types';
import Constants from 'expo-constants';

// Use environment variables for API keys (fallback to hardcoded for development)
const OPENROUTER_API_KEY = Constants.expoConfig?.extra?.OPENROUTER_API_KEY || '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';
const PERPLEXITY_API_KEY = Constants.expoConfig?.extra?.PERPLEXITY_API_KEY || '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';

// Updated models for 2025 - using available models
const GEMINI_MODEL = 'google/gemini-2.5-flash';
const PERPLEXITY_MODEL = 'sonar';

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

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'general': {
    primary: 'google/gemini-2.5-flash',
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

// Perplexity configuration for different query types
interface PerplexityConfig {
  model: string;
  searchMode?: 'web' | 'academic';
  reasoningEffort?: 'low' | 'medium' | 'high';
  maxSources?: number;
}

// Validate API keys
const validateApiKeys = () => {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your-openrouter-key-here') {
    console.warn('OpenRouter API key not configured properly');
  }
  if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === 'your-perplexity-key-here') {
    console.warn('Perplexity API key not configured properly');
  }
};

// Initialize validation
validateApiKeys();

// Get current date and time for context
const getCurrentDateTime = () => {
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
};

// Enhanced query classification
const classifyQuery = (query: string): QueryClassification => {
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
};

// Get Perplexity configuration based on query
const getPerplexityConfig = (query: string): PerplexityConfig => {
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
};

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

const handleAIError = (error: any, service: 'openrouter' | 'perplexity'): AIError => {
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
};

// Retry logic with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
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
};

export const callAI = async (
  messages: CoreMessage[], 
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const currentDateTime = getCurrentDateTime();
    const lastMessage = messages[messages.length - 1];
    const userQuery = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    
    // Classify the query to determine the best approach
    const classification = classifyQuery(userQuery);
    
    if (classification.needsWebSearch) {
      return await withRetry(() => callPerplexityAI(messages, currentDateTime, classification, onStream));
    } else {
      return await withRetry(() => callGeminiAI(messages, currentDateTime, classification, onStream));
    }
  } catch (error) {
    console.error('Error calling AI:', error);
    
    if (error instanceof AIError) {
      return `I apologize, but I'm experiencing some technical difficulties: ${error.message}`;
    }
    
    return "I apologize, but I'm having trouble connecting to my AI services right now. This could be due to network issues or temporary service unavailability. Please check your internet connection and try again in a moment.";
  }
};

const callGeminiAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  classification: QueryClassification,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const config = MODEL_CONFIGS[classification.queryType] || MODEL_CONFIGS['general'];
    
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
      model: GEMINI_MODEL,
      messages: enhancedMessages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: false
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
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
        model: GEMINI_MODEL,
        url: response.url
      });
      throw handleAIError({ status: response.status, message: errorText }, 'openrouter');
    }

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      return data.choices?.[0]?.message?.content || 'No response received from AI service';
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', { 
        error: jsonError, 
        responseText: responseText.substring(0, 200),
        status: response.status
      });
      throw new AIError(`Invalid JSON response: ${jsonError}`, 'openrouter');
    }
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw handleAIError(error, 'openrouter');
  }
};

const callPerplexityAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  classification: QueryClassification,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const config = getPerplexityConfig(typeof messages[messages.length - 1].content === 'string' ? messages[messages.length - 1].content as string : '');
    
    // Prepare messages for Perplexity - use only the last user message and system message
    const systemMessage = messages.find(msg => msg.role === 'system');
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    
    if (!lastUserMessage) {
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
      model: PERPLEXITY_MODEL,
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

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
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
        model: PERPLEXITY_MODEL,
        url: response.url
      });
      
      // Fallback to Gemini if Perplexity fails
      console.log('Falling back to Gemini AI due to Perplexity error...');
      return await callGeminiAI(messages, currentDateTime, classification, onStream);
    }

    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      const content = data.choices?.[0]?.message?.content || 'No response received from search service';
      
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
      throw new AIError(`Invalid JSON response from Perplexity: ${jsonError}`, 'perplexity');
    }
  } catch (error) {
    console.error('Perplexity AI error:', error);
    
    if (error instanceof AIError && error.service === 'perplexity') {
      // Fallback to Gemini if Perplexity fails
      console.log('Falling back to Gemini AI due to error...');
      return await callGeminiAI(messages, currentDateTime, classification, onStream);
    }
    
    throw handleAIError(error, 'perplexity');
  }
};

export const extractTasksFromAIResponse = (text: string): Task[] => {
  const tasks: Task[] = [];
  
  // Try to find task sections in the response
  const taskPatterns = [
    // Pattern for "Task: [title]" format
    /Task\s*\d*\s*:\s*([^\n.]+)(?:[\s\S]*?Date\s*:\s*(\d{4}-\d{2}-\d{2}))?(?:[\s\S]*?Time\s*:\s*(\d{1,2}:\d{2}))?(?:[\s\S]*?Priority\s*:\s*(low|medium|high))?/gi,
    
    // Pattern for numbered list format
    /\d+\.\s*([^\n.]+)(?:[\s\S]*?Date\s*:\s*(\d{4}-\d{2}-\d{2}))?(?:[\s\S]*?Time\s*:\s*(\d{1,2}:\d{2}))?(?:[\s\S]*?Priority\s*:\s*(low|medium|high))?/gi,
    
    // Pattern for bullet points
    /\*\s*([^\n.]+)(?:[\s\S]*?Date\s*:\s*(\d{4}-\d{2}-\d{2}))?(?:[\s\S]*?Time\s*:\s*(\d{1,2}:\d{2}))?(?:[\s\S]*?Priority\s*:\s*(low|medium|high))?/gi,
  ];
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Try each pattern
  for (const pattern of taskPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const title = match[1]?.trim();
      const date = match[2] || today;
      const time = match[3] || undefined;
      const priority = (match[4]?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high';
      
      if (title && title.length > 3) {
        tasks.push({
          id: Math.random().toString(36).substring(2, 9),
          title,
          description: `Extracted from assistant: "${title}"`,
          date,
          time,
          completed: false,
          priority,
          tags: [],
          createdAt: Date.now(),
        });
      }
    }
  }
  
  // If no structured tasks were found but there's text that might be a task
  if (tasks.length === 0) {
    // Look for sentences that might be tasks
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
    
    for (const sentence of sentences) {
      // Check if sentence contains action verbs or time indicators
      const actionVerbPattern = /\b(go|do|buy|call|meet|work|study|exercise|clean|cook|prepare|finish|start|attend|visit|pick|drop|send|write|read|watch|make|schedule|plan|book|order|pay|check)\b/i;
      if (actionVerbPattern.test(sentence) && sentence.length < 100) {
        tasks.push({
          id: Math.random().toString(36).substring(2, 9),
          title: sentence.trim(),
          description: `Extracted from assistant: "${sentence.trim()}"`,
          date: today,
          completed: false,
          priority: 'medium',
          tags: [],
          createdAt: Date.now(),
        });
        
        // Limit to 3 extracted tasks to avoid spam
        if (tasks.length >= 3) break;
      }
    }
  }
  
  return tasks;
};