import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export const EmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Bot size={48} color={colors.primary} strokeWidth={1.5} />
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
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});