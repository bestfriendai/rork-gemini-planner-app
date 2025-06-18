import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, icon }) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  iconContainer: {
    marginBottom: 40,
    opacity: 0.9,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  message: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: '90%',
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});