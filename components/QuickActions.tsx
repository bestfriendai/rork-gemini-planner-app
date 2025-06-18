import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Clock, Calendar, Cloud, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  TrendingUp, DollarSign, Coffee, Plane, Music, Book, Heart, Zap
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'current_time',
      title: 'Current Time',
      icon: <Clock size={24} color={colors.primary} />,
    },
    {
      id: 'today_date',
      title: "Today's Date",
      icon: <Calendar size={24} color={colors.primary} />,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Cloud size={24} color={colors.primary} />,
    },
    {
      id: 'news',
      title: 'Latest News',
      icon: <Newspaper size={24} color={colors.primary} />,
    },
    {
      id: 'stocks',
      title: 'Stock Market',
      icon: <TrendingUp size={24} color={colors.primary} />,
    },
    {
      id: 'crypto',
      title: 'Crypto Prices',
      icon: <DollarSign size={24} color={colors.primary} />,
    },
    {
      id: 'calculate',
      title: 'Calculator',
      icon: <Calculator size={24} color={colors.primary} />,
    },
    {
      id: 'location',
      title: 'My Location',
      icon: <MapPin size={24} color={colors.primary} />,
    },
    {
      id: 'schedule',
      title: 'Plan My Day',
      icon: <CheckSquare size={24} color={colors.primary} />,
    },
    {
      id: 'reminder',
      title: 'Set Reminder',
      icon: <Bell size={24} color={colors.primary} />,
    },
    {
      id: 'recipe',
      title: 'Recipe Ideas',
      icon: <Coffee size={24} color={colors.primary} />,
    },
    {
      id: 'travel',
      title: 'Travel Info',
      icon: <Plane size={24} color={colors.primary} />,
    },
    {
      id: 'music',
      title: 'Music Trends',
      icon: <Music size={24} color={colors.primary} />,
    },
    {
      id: 'books',
      title: 'Book Recommendations',
      icon: <Book size={24} color={colors.primary} />,
    },
    {
      id: 'health',
      title: 'Health Tips',
      icon: <Heart size={24} color={colors.primary} />,
    },
    {
      id: 'productivity',
      title: 'Productivity Tips',
      icon: <Zap size={24} color={colors.primary} />,
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
            <LinearGradient
              colors={[colors.surface, colors.surfaceSecondary]}
              style={styles.actionGradient}
            >
              <View style={styles.iconContainer}>
                {action.icon}
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 32,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 24,
    letterSpacing: -0.8,
  },
  scrollContent: {
    paddingRight: 24,
  },
  actionButton: {
    marginRight: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  actionGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    minWidth: 110,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});