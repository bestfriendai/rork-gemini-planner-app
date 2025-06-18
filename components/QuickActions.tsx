import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Clock, Calendar, Cloud, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  TrendingUp, DollarSign, Coffee, Plane
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'current_time',
      title: 'Current Time',
      icon: <Clock size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'today_date',
      title: "Today's Date",
      icon: <Calendar size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Cloud size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'news',
      title: 'Latest News',
      icon: <Newspaper size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'stocks',
      title: 'Stock Market',
      icon: <TrendingUp size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'crypto',
      title: 'Crypto Prices',
      icon: <DollarSign size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'calculate',
      title: 'Calculator',
      icon: <Calculator size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'location',
      title: 'My Location',
      icon: <MapPin size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'schedule',
      title: 'Plan My Day',
      icon: <CheckSquare size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'reminder',
      title: 'Set Reminder',
      icon: <Bell size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'recipe',
      title: 'Recipe Ideas',
      icon: <Coffee size={18} color={colors.primary} strokeWidth={1.5} />,
    },
    {
      id: 'travel',
      title: 'Travel Info',
      icon: <Plane size={18} color={colors.primary} strokeWidth={1.5} />,
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
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 12,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 64,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 12,
  },
});