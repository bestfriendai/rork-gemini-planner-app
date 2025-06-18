import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, Category, TimeBlock } from '@/types';
import { getCurrentDate, formatDate } from '@/utils/dateUtils';

interface TaskState {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  timeBlocks: TimeBlock[];
  
  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string; // Returns the new task ID
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  getTasksByDate: (date: string) => Task[];
  getTasksByDateRange: (startDate: string, endDate: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByCategory: (category: string) => Task[];
  getCompletedTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
  
  // Subtask methods
  addSubtask: (taskId: string, subtaskTitle: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Project methods
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string; // Returns the new project ID
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  
  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => string; // Returns the new category ID
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  deleteCategory: (id: string) => void;
  
  // TimeBlock methods
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => string; // Returns the new timeBlock ID
  updateTimeBlock: (id: string, updates: Partial<Omit<TimeBlock, 'id'>>) => void;
  deleteTimeBlock: (id: string) => void;
  getTimeBlocksByDate: (date: string) => TimeBlock[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      categories: [
        { id: 'work', name: 'Work', color: '#4285F4' },
        { id: 'personal', name: 'Personal', color: '#34A853' },
        { id: 'health', name: 'Health', color: '#EA4335' },
        { id: 'education', name: 'Education', color: '#FBBC05' },
      ],
      timeBlocks: [],
      
      // Task methods
      addTask: (task) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id,
              createdAt: Date.now(),
            },
          ],
        }));
        
        // Handle recurring tasks
        if (task.recurrence) {
          // Implementation for creating recurring task instances will be added here
        }
        
        return id;
      },
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      toggleTaskCompletion: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? Date.now() : undefined 
          } : task
        ),
      })),
      
      getTasksByDate: (date) => {
        const { tasks } = get();
        return tasks.filter((task) => task.date === date);
      },
      
      getTasksByDateRange: (startDate, endDate) => {
        const { tasks } = get();
        return tasks.filter((task) => {
          return task.date >= startDate && task.date <= endDate;
        });
      },
      
      getTasksByProject: (projectId) => {
        const { tasks } = get();
        return tasks.filter((task) => task.projectId === projectId);
      },
      
      getTasksByCategory: (category) => {
        const { tasks } = get();
        return tasks.filter((task) => task.category === category);
      },
      
      getCompletedTasks: () => {
        const { tasks } = get();
        return tasks.filter((task) => task.completed);
      },
      
      getOverdueTasks: () => {
        const { tasks } = get();
        const today = getCurrentDate();
        return tasks.filter((task) => 
          !task.completed && task.date < today
        );
      },
      
      getUpcomingTasks: (days) => {
        const { tasks } = get();
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + days);
        
        return tasks.filter((task) => {
          const taskDate = new Date(task.date);
          return !task.completed && 
                 taskDate >= today && 
                 taskDate <= endDate;
        });
      },
      
      // Subtask methods
      addSubtask: (taskId, subtaskTitle) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: [
                  ...(task.subtasks || []),
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    title: subtaskTitle,
                    completed: false,
                  },
                ],
              }
            : task
        ),
      })),
      
      updateSubtask: (taskId, subtaskId, title) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.map(sub =>
                    sub.id === subtaskId ? { ...sub, title } : sub
                ),
              }
            : task
        ),
      })),
      
      toggleSubtaskCompletion: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.map(sub =>
                    sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
                ),
              }
            : task
        ),
      })),
      
      deleteSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks?.filter(sub => sub.id !== subtaskId),
              }
            : task
        ),
      })),
      
      // Project methods
      addProject: (project) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id,
              createdAt: Date.now(),
            },
          ],
        }));
        return id;
      },
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        ),
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      })),
      
      // Category methods
      addCategory: (category) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          categories: [
            ...state.categories,
            {
              ...category,
              id,
            },
          ],
        }));
        return id;
      },
      
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, ...updates } : category
        ),
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
      })),
      
      // TimeBlock methods
      addTimeBlock: (timeBlock) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          timeBlocks: [
            ...state.timeBlocks,
            {
              ...timeBlock,
              id,
            },
          ],
        }));
        return id;
      },
      
      updateTimeBlock: (id, updates) => set((state) => ({
        timeBlocks: state.timeBlocks.map((timeBlock) =>
          timeBlock.id === id ? { ...timeBlock, ...updates } : timeBlock
        ),
      })),
      
      deleteTimeBlock: (id) => set((state) => ({
        timeBlocks: state.timeBlocks.filter((timeBlock) => timeBlock.id !== id),
      })),
      
      getTimeBlocksByDate: (date) => {
        const { timeBlocks } = get();
        return timeBlocks.filter((timeBlock) => timeBlock.date === date);
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);