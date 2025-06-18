import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  Clock, Calendar, CloudSun, Newspaper, CheckSquare, Bell, Calculator, MapPin,
  TrendingUp, DollarSign
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'current_time',
      title: 'Time',
      icon: <Clock size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'today_date',
      title: 'Date',
      icon: <Calendar size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <CloudSun size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'news',
      title: 'News',
      icon: <Newspaper size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'stocks',
      title: 'Stocks',
      icon: <TrendingUp size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'crypto',
      title: 'Crypto',
      icon: <DollarSign size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'calculate',
      title: 'Calculate',
      icon: <Calculator size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'location',
      title: 'Location',
      icon: <MapPin size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'schedule',
      title: 'Plan Day',
      icon: <CheckSquare size={18} color={colors.primary} strokeWidth={1.8} />,
    },
    {
      id: 'reminder',
      title: 'Reminder',
      icon: <Bell size={18} color={colors.primary} strokeWidth={1.8} />,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={() => onAction(action.id)}
          >
            <View style={styles.iconContainer}>
              {action.icon}
            </View>
            <Text style={styles.actionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surfaceSecondary,
    marginHorizontal: 16,
    marginBottom: 140,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
    ...shadows.medium,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
    paddingBottom: 4,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 18,
    minWidth: 68,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
    ...shadows.small,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
});