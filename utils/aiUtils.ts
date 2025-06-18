import { CoreMessage, Task } from '@/types';

const OPENROUTER_API_KEY = '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';
const PERPLEXITY_API_KEY = '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';
const GEMINI_MODEL = 'google/gemini-2.5-flash-lite-preview-06-17';
const PERPLEXITY_MODEL = 'sonar';

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

// Check if query needs web search
const needsWebSearch = (query: string): boolean => {
  const webSearchKeywords = [
    'current', 'latest', 'recent', 'today', 'news', 'weather', 'stock', 'price',
    'what is happening', 'what happened', 'search for', 'find information',
    'look up', 'google', 'internet', 'online', 'website', 'url', 'link',
    'trending', 'popular', 'viral', 'breaking', 'update', 'live'
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
    throw error;
  }
};

const callGeminiAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
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
      'X-Title': 'Personal Assistant App',
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: enhancedMessages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenRouter API error:', errorData);
    throw new Error(`API error: ${response.status}`);
  }

  if (onStream && response.body) {
    return await handleStreamResponse(response, onStream);
  } else {
    const data = await response.json();
    return data.choices[0].message.content;
  }
};

const callPerplexityAI = async (
  messages: CoreMessage[], 
  currentDateTime: any,
  onStream?: (chunk: string) => void
): Promise<string> => {
  // Filter and format messages for Perplexity (ensure alternating user/assistant)
  const filteredMessages: CoreMessage[] = [];
  
  // Add system message first
  const systemMessage = messages.find(msg => msg.role === 'system');
  if (systemMessage) {
    filteredMessages.push({
      ...systemMessage,
      content: `${systemMessage.content}

CURRENT DATE & TIME CONTEXT:
- Today is: ${currentDateTime.date}
- Current time: ${currentDateTime.time}
- Timezone: ${currentDateTime.timezone}
- ISO Date: ${currentDateTime.isoDate}

You have access to current web information. Use it to provide up-to-date answers.`
    });
  }
  
  // Add user/assistant messages in proper alternating order
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  // Ensure we have proper alternating pattern
  for (let i = 0; i < conversationMessages.length; i++) {
    const msg = conversationMessages[i];
    const lastAdded = filteredMessages[filteredMessages.length - 1];
    
    // Add message if it's different from the last role or if it's the first conversation message
    if (!lastAdded || lastAdded.role === 'system' || lastAdded.role !== msg.role) {
      filteredMessages.push(msg);
    }
  }
  
  // Ensure we end with a user message for Perplexity
  const lastMsg = filteredMessages[filteredMessages.length - 1];
  if (lastMsg && lastMsg.role !== 'user') {
    // Find the last user message and add it
    const lastUserMsg = conversationMessages.filter(msg => msg.role === 'user').pop();
    if (lastUserMsg) {
      filteredMessages.push(lastUserMsg);
    }
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: filteredMessages,
      max_tokens: 1000,
      temperature: 0.7,
      search_mode: 'web',
      return_images: false,
      return_related_questions: false,
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Perplexity API error:', errorText);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  if (onStream && response.body) {
    return await handleStreamResponse(response, onStream);
  } else {
    const data = await response.json();
    return data.choices[0].message.content;
  }
};

const handleStreamResponse = async (
  response: Response, 
  onStream: (chunk: string) => void
): Promise<string> => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  let fullResponse = '';
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onStream(content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullResponse;
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
      if (/\b(go|do|buy|call|meet|work|study|exercise|clean|cook|prepare|finish|start|attend|visit|pick|drop|send|write|read|watch|make)\b/i.test(sentence)) {
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