import { Platform } from 'react-native';

// Light theme with pastel primary/secondary colors inspired by iOS and Notion
export const colors = {
  // Primary - Pastel Blue
  primary: '#5B9EE1',
  primaryMuted: '#D6E6F7',
  
  // Secondary - Pastel Coral
  accent1: '#F28B82',
  accent2: '#F6C358',
  
  // Neutrals
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  surfaceTertiary: '#E9ECEF',
  border: '#DEE2E6',
  text: '#212529',
  textSecondary: '#495057',
  textTertiary: '#868E96',
  
  // Status
  success: '#51CF66',
  warning: '#F6C358',
  error: '#FF6B6B',
  
  // Shadows
  shadow: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.2)',
};