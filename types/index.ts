export type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
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
  subtasks?: Subtask[];
  projectId?: string; // For grouping tasks by project
  category?: string; // For categorizing tasks (work, personal, etc.)
  estimatedDuration?: number; // In minutes
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // Every X days/weeks/months/years
    endDate?: string; // ISO string
    occurrences?: number; // Number of occurrences
  };
  reminderTime?: number; // Minutes before task time
  location?: string; // Location for the task
  createdAt: number;
  completedAt?: number; // When the task was completed
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: number;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type TimeBlock = {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  date: string; // ISO string
  category?: string;
  color?: string;
};

export type ContentPart = 
  | { type: 'text'; text: string; }
  | { type: 'image'; image: string };

export type CoreMessage = 
  | { role: 'system'; content: string; }  
  | { role: 'user'; content: string | Array<ContentPart>; }
  | { role: 'assistant'; content: string | Array<ContentPart>; };