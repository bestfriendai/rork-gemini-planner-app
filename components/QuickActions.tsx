import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Clock, Calendar, CloudSun, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  TrendingUp, DollarSign
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'current_time',
      title: 'Time',
      icon: <Clock size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.accent3,
    },
    {
      id: 'today_date',
      title: 'Date',
      icon: <Calendar size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.accent4,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <CloudSun size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.accent5,
    },
    {
      id: 'news',
      title: 'News',
      icon: <Newspaper size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.accent1,
    },
    {
      id: 'stocks',
      title: 'Stocks',
      icon: <TrendingUp size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.success,
    },
    {
      id: 'crypto',
      title: 'Crypto',
      icon: <DollarSign size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.warning,
    },
    {
      id: 'calculate',
      title: 'Calculate',
      icon: <Calculator size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.accent6,
    },
    {
      id: 'location',
      title: 'Location',
      icon: <MapPin size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.accent2,
    },
    {
      id: 'schedule',
      title: 'Plan Day',
      icon: <CheckSquare size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.primary,
    },
    {
      id: 'reminder',
      title: 'Reminder',
      icon: <Bell size={20} color={colors.primary} strokeWidth={2} />,
      color: colors.error,
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
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
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
    padding: 20,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 72,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
});