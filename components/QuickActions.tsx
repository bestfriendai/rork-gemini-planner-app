import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Clock, Calendar, Cloud, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  TrendingUp, DollarSign, Coffee, Plane, Music, Book, Heart, Zap
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
      icon: <Clock size={20} color={colors.primary} />,
    },
    {
      id: 'today_date',
      title: "Today's Date",
      icon: <Calendar size={20} color={colors.primary} />,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Cloud size={20} color={colors.primary} />,
    },
    {
      id: 'news',
      title: 'Latest News',
      icon: <Newspaper size={20} color={colors.primary} />,
    },
    {
      id: 'stocks',
      title: 'Stock Market',
      icon: <TrendingUp size={20} color={colors.primary} />,
    },
    {
      id: 'crypto',
      title: 'Crypto Prices',
      icon: <DollarSign size={20} color={colors.primary} />,
    },
    {
      id: 'calculate',
      title: 'Calculator',
      icon: <Calculator size={20} color={colors.primary} />,
    },
    {
      id: 'location',
      title: 'My Location',
      icon: <MapPin size={20} color={colors.primary} />,
    },
    {
      id: 'schedule',
      title: 'Plan My Day',
      icon: <CheckSquare size={20} color={colors.primary} />,
    },
    {
      id: 'reminder',
      title: 'Set Reminder',
      icon: <Bell size={20} color={colors.primary} />,
    },
    {
      id: 'recipe',
      title: 'Recipe Ideas',
      icon: <Coffee size={20} color={colors.primary} />,
    },
    {
      id: 'travel',
      title: 'Travel Info',
      icon: <Plane size={20} color={colors.primary} />,
    },
    {
      id: 'music',
      title: 'Music Trends',
      icon: <Music size={20} color={colors.primary} />,
    },
    {
      id: 'books',
      title: 'Book Recommendations',
      icon: <Book size={20} color={colors.primary} />,
    },
    {
      id: 'health',
      title: 'Health Tips',
      icon: <Heart size={20} color={colors.primary} />,
    },
    {
      id: 'productivity',
      title: 'Productivity Tips',
      icon: <Zap size={20} color={colors.primary} />,
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
    padding: 24,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
});