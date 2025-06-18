import { Platform } from 'react-native';

export interface ShadowConfig {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

/**
 * Creates cross-platform shadow styles that work on both native and web
 * On web, converts to boxShadow; on native, uses platform-specific shadow props
 */
export const createShadow = (config: ShadowConfig) => {
  const {
    shadowColor = '#000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.1,
    shadowRadius = 4,
    elevation = 4,
  } = config;

  if (Platform.OS === 'web') {
    // Convert to CSS boxShadow for web compatibility
    const { width, height } = shadowOffset;
    const blur = shadowRadius;
    const alpha = shadowOpacity;
    
    // Convert hex color to rgba if needed
    let color = shadowColor;
    if (shadowColor.startsWith('#')) {
      const hex = shadowColor.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return {
      boxShadow: `${width}px ${height}px ${blur}px ${color}`,
    };
  }

  // Use native shadow properties for iOS/Android
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation, // Android
  };
};

// Common shadow presets based on Apple Design Standards
export const shadows = {
  // Subtle elevation for UI elements (cards, buttons)
  small: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  }),
  
  // Medium elevation for floating elements
  medium: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  }),
  
  // High elevation for modals and dialogs
  large: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  }),
  
  // Tab bar shadow (inverted direction)
  tab: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  }),
  
  // Apple-style button shadow
  button: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  }),
  
  // Apple-style card shadow
  card: createShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  }),
};

/**
 * Helper function to get shadow by elevation level
 * @param level - Elevation level (1-5)
 * @returns Shadow style object
 */
export const getShadow = (level: number = 1) => {
  switch (level) {
    case 1:
      return shadows.small;
    case 2:
      return shadows.medium;
    case 3:
      return shadows.large;
    case 4:
      return shadows.card;
    case 5:
      return shadows.button;
    default:
      return shadows.small;
  }
};
