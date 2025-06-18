export type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  time?: string; // HH:MM format
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt: number;
};

export type ContentPart = 
  | { type: 'text'; text: string; }
  | { type: 'image'; image: string };

export type CoreMessage = 
  | { role: 'system'; content: string; }  
  | { role: 'user'; content: string | Array<ContentPart>; }
  | { role: 'assistant'; content: string | Array<ContentPart>; };