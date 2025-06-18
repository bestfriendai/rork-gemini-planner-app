import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export const EmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Bot size={40} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>Jarva AI Assistant</Text>
      <Text style={styles.subtitle}>
        Your intelligent companion for productivity, planning, and getting things done. Ask me anything!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});