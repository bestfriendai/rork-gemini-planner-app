import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading';
  text?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, text }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return colors.success;
      case 'offline': return colors.error;
      case 'loading': return colors.warning;
      default: return colors.textTertiary;
    }
  };

  const getStatusText = () => {
    if (text) return text;
    switch (status) {
      case 'online': return 'Connected';
      case 'offline': return 'Offline';
      case 'loading': return 'Connecting...';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});