import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

interface TodaySummaryProps {
  username?: string;
  taskCount: number;
}

export const TodaySummary: React.FC<TodaySummaryProps> = ({ username, taskCount }) => {
  const greeting = username ? `Good morning, ${username}.` : 'Good morning.';
  const summary = taskCount > 0 
    ? `You have ${taskCount} task${taskCount > 1 ? 's' : ''} to focus on today.`
    : `Your schedule is clear for today. What would you like to plan?`;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Bot size={24} color={colors.primary} strokeWidth={1.5}/>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Calendar size={16} color={colors.textSecondary} strokeWidth={1.5}/>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.medium,
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    ...shadows.small,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dateContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    ...shadows.small,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
});
