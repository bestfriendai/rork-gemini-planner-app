import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, CoreMessage } from '@/types';
import { Platform } from 'react-native';
import { processAIRequest, AIError, ErrorSeverity } from '@/utils/aiUtils';
import { initializeAPIKeys, validateAPIKeys } from '@/utils/config';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isInitialized: boolean;
  initError: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  formatMessagesForAPI: () => CoreMessage[];
  initializeAPI: () => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      isInitialized: false,
      initError: null,
      
      initializeAPI: async () => {
        try {
          await initializeAPIKeys();
          const validation = validateAPIKeys();
          
          if (!validation.valid) {
            set({ 
              isInitialized: false, 
              initError: validation.errors.join(', ') 
            });
            return;
          }
          
          set({ isInitialized: true, initError: null });
        } catch (error) {
          console.error('Failed to initialize API:', error);
          set({ 
            isInitialized: false, 
            initError: 'Failed to initialize API keys. Please check your connection.' 
          });
        }
      },
      
      addMessage: async (message) => {
        const newMessage: Message = {
          ...message,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        // If it's a user message, get AI response
        if (message.role === 'user') {
          set({ isLoading: true });
          
          try {
            // Ensure API is initialized
            if (!get().isInitialized) {
              await get().initializeAPI();
              if (!get().isInitialized) {
                throw new Error(get().initError || 'API not initialized');
              }
            }
            
            const apiMessages = get().formatMessagesForAPI();
            const currentDateTime = new Date();
            
            let streamingResponse = '';
            const response = await processAIRequest(
              apiMessages,
              currentDateTime,
              (chunk: string) => {
                if (chunk) {
                  streamingResponse += chunk;
                  // Update the last assistant message with streaming content
                  set((state) => {
                    const messages = [...state.messages];
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                      lastMessage.content = streamingResponse;
                    } else {
                      messages.push({
                        id: Math.random().toString(36).substring(2, 9),
                        role: 'assistant',
                        content: streamingResponse,
                        timestamp: Date.now(),
                      });
                    }
                    return { messages };
                  });
                }
              }
            );

            // Add final response if not streaming or update final content
            if (!streamingResponse) {
              const assistantMessage: Message = {
                id: Math.random().toString(36).substring(2, 9),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
              };
              
              set((state) => ({
                messages: [...state.messages, assistantMessage],
              }));
            } else {
              // Ensure final content is set
              set((state) => {
                const messages = [...state.messages];
                const lastMessage = messages[messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = response || streamingResponse;
                }
                return { messages };
              });
            }
          } catch (error) {
            console.error('AI request failed:', error);
            
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            
            if (error instanceof AIError) {
              switch (error.severity) {
                case ErrorSeverity.LOW:
                  errorMessage = error.message;
                  break;
                case ErrorSeverity.MEDIUM:
                  errorMessage = `${error.message} (Service: ${error.service})`;
                  break;
                case ErrorSeverity.HIGH:
                case ErrorSeverity.CRITICAL:
                  errorMessage = "I'm having trouble connecting to my AI services. Please check your internet connection and try again.";
                  break;
              }
            }
            
            const errorResponse: Message = {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant',
              content: errorMessage,
              timestamp: Date.now(),
            };
            
            set((state) => ({
              messages: [...state.messages, errorResponse],
            }));
          } finally {
            set({ isLoading: false });
          }
        }
      },
      
      clearMessages: () => set({ messages: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      
      formatMessagesForAPI: () => {
        const { messages } = get();
        const currentDateTime = new Date();
        const dateTimeString = currentDateTime.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const deviceInfo = Platform.OS === 'web' 
          ? `Web Browser (${typeof navigator !== 'undefined' && navigator.userAgent.includes('Chrome') ? 'Chrome' : typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'})`
          : `${Platform.OS} App (${Platform.Version})`;
        
        return [
          { 
            role: 'system', 
            content: `You are Jarva, a helpful personal assistant focused on planning, scheduling, productivity, and providing current information.

CURRENT CONTEXT:
- Date and time: ${dateTimeString}
- Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
- Platform: ${deviceInfo}
- User location: Available via geolocation API

CAPABILITIES:
1. Task Management: Help create, organize, and schedule tasks
2. Current Information: Search the web for news, weather, stock prices, etc.
3. Calculations: Perform math calculations, conversions, percentages
4. Time & Date: Provide current time, date, timezone information
5. Device Info: Share platform and device details
6. Location Services: Help with location-based queries
7. Planning: Assist with daily planning and scheduling

TASK EXTRACTION:
When users ask you to schedule something or create tasks, format them clearly:

Task: [task title]
Date: YYYY-MM-DD (use today's date: ${currentDateTime.toISOString().split('T')[0]} if not specified)
Time: HH:MM (if mentioned)
Priority: [low/medium/high] (default to medium)

Example:
"I need to go to the gym at 4 PM and buy groceries tomorrow"

Response:
"I'll help you schedule those tasks:

Task: Go to the gym
Date: ${currentDateTime.toISOString().split('T')[0]}
Time: 16:00
Priority: medium

Task: Buy groceries
Date: ${new Date(currentDateTime.getTime() + 24*60*60*1000).toISOString().split('T')[0]}
Priority: medium"

SEARCH QUERIES:
For current information (news, weather, stocks, etc.), use web search to provide up-to-date answers.

Be helpful, concise, and practical. Always use the current date/time context provided above.`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ] as CoreMessage[];
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);