import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, Sparkles } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

export const EmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Bot size={40} color={colors.primary} strokeWidth={1.5} />
        <View style={styles.sparklesContainer}>
          <Sparkles size={18} color={colors.white} strokeWidth={1.5} />
        </View>
      </View>
      <Text style={styles.title}>Jarva AI Assistant</Text>
      <Text style={styles.subtitle}>
        Your intelligent companion for productivity, planning, and getting things done. Ask me anything!
      </Text>
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>Plan your day</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>Manage tasks</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>Get answers</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...shadows.medium,
    position: 'relative',
  },
  sparklesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 2,
    borderColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    gap: 8,
  },
  featureItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    ...shadows.small,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  featureText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});