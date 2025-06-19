import { Platform } from 'react-native';

// Modern dark theme inspired by Linear and Notion
export const colors = {
  // Base colors
  primary: '#6366F1', // Indigo
  primaryMuted: '#6366F120',
  
  // Surface colors
  background: '#000000',
  surface: '#111111',
  surfaceSecondary: '#1A1A1A',
  surfaceTertiary: '#222222',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#52525B',
  textQuaternary: '#27272A',
  
  // Border colors
  border: '#27272A',
  
  // Accent colors
  accent1: '#22D3EE', // Cyan
  accent2: '#F472B6', // Pink
  accent3: '#34D399', // Emerald
  accent4: '#A78BFA', // Violet
  accent5: '#FB923C', // Orange
  accent6: '#FACC15', // Yellow
  
  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gradients
  gradients: {
    primary: ['#6366F1', '#4F46E5'],
    success: ['#22C55E', '#16A34A'],
    warning: ['#F59E0B', '#D97706'],
    error: ['#EF4444', '#DC2626'],
  },
  
  // Platform specific shadows
  shadows: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    android: {
      elevation: 5,
    },
    web: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  }),
};

// Type definitions for colors
export type ColorTheme = typeof colors;
export type ColorKey = keyof typeof colors;