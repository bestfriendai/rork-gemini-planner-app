import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading';
  text?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, text }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#34C759';
      case 'offline': return '#FF3B30';
      case 'loading': return '#F9A826';
      default: return '#6E7A8A';
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
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    color: '#6E7A8A',
    fontWeight: '500',
  },
});