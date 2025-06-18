import { CoreMessage, Task } from '@/types';
import Constants from 'expo-constants';

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const OPENROUTER_API_KEY = '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';
const PERPLEXITY_API_KEY = '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';
const GEMINI_MODEL = 'google/gemini-2.0-flash-thinking-exp';
const PERPLEXITY_MODEL = 'sonar-large-online';
=======
=======
>>>>>>> Stashed changes
// Use environment variables for API keys (fallback to hardcoded for development)
const OPENROUTER_API_KEY = Constants.expoConfig?.extra?.OPENROUTER_API_KEY || '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';
const PERPLEXITY_API_KEY = Constants.expoConfig?.extra?.PERPLEXITY_API_KEY || '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';

// Updated models for 2025 - using available models
const GEMINI_MODEL = 'google/gemini-2.5-flash-lite-preview-06-17';
const PERPLEXITY_MODEL = 'llama-3.1-sonar-small-128k-online';

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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

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
const needsWebSearch = (query: string): boolean => {
  const webSearchKeywords = [
    'current', 'latest', 'recent', 'today', 'news', 'weather', 'stock', 'price',
    'what is happening', 'what happened', 'search for', 'find information',
    'look up', 'trending', 'popular', 'viral', 'breaking', 'update', 'live', 'now',
    'cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'market', 'exchange rate',
    'real-time', 'current events', 'happening now'
  ];
  
  return webSearchKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const callAI = async (
  messages: CoreMessage[], 
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const currentDateTime = getCurrentDateTime();
    const lastMessage = messages[messages.length - 1];
    const userQuery = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    
    // Check if we need web search
    const useWebSearch = needsWebSearch(userQuery);
    
    if (useWebSearch) {
      return await callPerplexityAI(messages, currentDateTime, onStream);
    } else {
      return await callGeminiAI(messages, currentDateTime, onStream);
    }
  } catch (error) {
    console.error('Error calling AI:', error);
    
    // Return a helpful error message instead of throwing
    return "I apologize, but I'm having trouble connecting to my AI services right now. This could be due to network issues or temporary service unavailability. Please check your internet connection and try again in a moment.";
  }
};

const callGeminiAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
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

When users ask about "today", "now", "current time", etc., use this information.`
        };
      }
      return msg;
    });

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
        max_tokens: 2000,
        temperature: 0.7,
        stream: false,
      }),
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
      throw new Error(`OpenRouter API error: ${response.status} - ${response.statusText}`);
    }

    // Read response text first to avoid "Already read" error
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      return data.choices?.[0]?.message?.content || 'No response received from AI service';
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', { 
        error: jsonError, 
        responseText: responseText.substring(0, 200),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Invalid JSON response: ${jsonError}`);
    }
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw error;
  }
};

const callPerplexityAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    // Prepare messages for Perplexity - use only the last user message and system message
    const systemMessage = messages.find(msg => msg.role === 'system');
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    
    if (!lastUserMessage) {
      throw new Error('No user message found');
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

Use web search to provide current, accurate information.`
      });
    }
    
    perplexityMessages.push(lastUserMessage);

    const requestBody = {
      model: PERPLEXITY_MODEL,
      messages: perplexityMessages,
      max_tokens: 2000,
      temperature: 0.7,
      stream: false,
    };

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
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
      return await callGeminiAI(messages, currentDateTime, onStream);
    }

    // Read response text first to avoid "Already read" error
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      return data.choices?.[0]?.message?.content || 'No response received from search service';
    } catch (jsonError) {
      console.error('Failed to parse Perplexity JSON response:', { 
        error: jsonError, 
        responseText: responseText.substring(0, 200),
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Invalid JSON response from Perplexity: ${jsonError}`);
    }
  } catch (error) {
    console.error('Perplexity AI error:', error);
    
    // Fallback to Gemini if Perplexity fails
    console.log('Falling back to Gemini AI due to error...');
    return await callGeminiAI(messages, currentDateTime, onStream);
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
      
      if (title) {
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
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      // Check if sentence contains action verbs or time indicators
      const actionVerbPattern = /\b(go|do|buy|call|meet|work|study|exercise|clean|cook|prepare|finish|start|attend|visit|pick|drop|send|write|read|watch|make)\b/i;
      if (actionVerbPattern.test(sentence)) {
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
      }
    }
  }
  
  return tasks;
};