import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Clock, Calendar, Cloud, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  Wifi, Smartphone, TrendingUp, DollarSign, Coffee, Plane, Music, Book,
  Heart, Zap, Target, Brain, Camera, Image, FileText, Mail, Phone, 
  ShoppingCart, Car, Home, Briefcase, Gamepad2, Palette, Globe, Lightbulb,
  Compass, Thermometer, Activity, Bookmark, Gift, Star, Headphones, Monitor
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
      icon: <Clock size={22} color={colors.primary} />,
    },
    {
      id: 'today_date',
      title: "Today's Date",
      icon: <Calendar size={22} color={colors.primary} />,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Cloud size={22} color={colors.primary} />,
    },
    {
      id: 'news',
      title: 'Latest News',
      icon: <Newspaper size={22} color={colors.primary} />,
    },
    {
      id: 'stocks',
      title: 'Stock Market',
      icon: <TrendingUp size={22} color={colors.primary} />,
    },
    {
      id: 'crypto',
      title: 'Crypto Prices',
      icon: <DollarSign size={22} color={colors.primary} />,
    },
    {
      id: 'calculate',
      title: 'Calculator',
      icon: <Calculator size={22} color={colors.primary} />,
    },
    {
      id: 'location',
      title: 'My Location',
      icon: <MapPin size={22} color={colors.primary} />,
    },
    {
      id: 'schedule',
      title: 'Plan My Day',
      icon: <CheckSquare size={22} color={colors.primary} />,
    },
    {
      id: 'reminder',
      title: 'Set Reminder',
      icon: <Bell size={22} color={colors.primary} />,
    },
    {
      id: 'recipe',
      title: 'Recipe Ideas',
      icon: <Coffee size={22} color={colors.primary} />,
    },
    {
      id: 'travel',
      title: 'Travel Info',
      icon: <Plane size={22} color={colors.primary} />,
    },
    {
      id: 'music',
      title: 'Music Trends',
      icon: <Music size={22} color={colors.primary} />,
    },
    {
      id: 'books',
      title: 'Book Recommendations',
      icon: <Book size={22} color={colors.primary} />,
    },
    {
      id: 'health',
      title: 'Health Tips',
      icon: <Heart size={22} color={colors.primary} />,
    },
    {
      id: 'productivity',
      title: 'Productivity Tips',
      icon: <Zap size={22} color={colors.primary} />,
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
    padding: 20,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: 90,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
});