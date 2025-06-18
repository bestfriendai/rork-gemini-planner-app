import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Clock, Calendar, Cloud, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  Wifi, Smartphone, TrendingUp, DollarSign, Coffee, Plane, Music, Book,
  Heart, Zap, Target, Brain, Camera, Image, FileText, Mail, Phone, 
  ShoppingCart, Car, Home, Briefcase, Gamepad2, Palette
} from 'lucide-react-native';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'current_time',
      title: 'Current Time',
      icon: <Clock size={20} color="#4A86E8" />,
    },
    {
      id: 'today_date',
      title: "Today's Date",
      icon: <Calendar size={20} color="#4A86E8" />,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <Cloud size={20} color="#4A86E8" />,
    },
    {
      id: 'news',
      title: 'Latest News',
      icon: <Newspaper size={20} color="#4A86E8" />,
    },
    {
      id: 'stocks',
      title: 'Stock Market',
      icon: <TrendingUp size={20} color="#4A86E8" />,
    },
    {
      id: 'crypto',
      title: 'Crypto Prices',
      icon: <DollarSign size={20} color="#4A86E8" />,
    },
    {
      id: 'calculate',
      title: 'Calculator',
      icon: <Calculator size={20} color="#4A86E8" />,
    },
    {
      id: 'location',
      title: 'My Location',
      icon: <MapPin size={20} color="#4A86E8" />,
    },
    {
      id: 'schedule',
      title: 'Plan My Day',
      icon: <CheckSquare size={20} color="#4A86E8" />,
    },
    {
      id: 'reminder',
      title: 'Set Reminder',
      icon: <Bell size={20} color="#4A86E8" />,
    },
    {
      id: 'recipe',
      title: 'Recipe Ideas',
      icon: <Coffee size={20} color="#4A86E8" />,
    },
    {
      id: 'travel',
      title: 'Travel Info',
      icon: <Plane size={20} color="#4A86E8" />,
    },
    {
      id: 'music',
      title: 'Music Trends',
      icon: <Music size={20} color="#4A86E8" />,
    },
    {
      id: 'books',
      title: 'Book Recommendations',
      icon: <Book size={20} color="#4A86E8" />,
    },
    {
      id: 'health',
      title: 'Health Tips',
      icon: <Heart size={20} color="#4A86E8" />,
    },
    {
      id: 'productivity',
      title: 'Productivity Tips',
      icon: <Zap size={20} color="#4A86E8" />,
    },
    {
      id: 'goals',
      title: 'Goal Setting',
      icon: <Target size={20} color="#4A86E8" />,
    },
    {
      id: 'learning',
      title: 'Learning Resources',
      icon: <Brain size={20} color="#4A86E8" />,
    },
    {
      id: 'shopping',
      title: 'Shopping List',
      icon: <ShoppingCart size={20} color="#4A86E8" />,
    },
    {
      id: 'workout',
      title: 'Workout Plan',
      icon: <Heart size={20} color="#4A86E8" />,
    },
    {
      id: 'meditation',
      title: 'Meditation Guide',
      icon: <Brain size={20} color="#4A86E8" />,
    },
    {
      id: 'creative',
      title: 'Creative Ideas',
      icon: <Palette size={20} color="#4A86E8" />,
    },
    {
      id: 'business',
      title: 'Business Tips',
      icon: <Briefcase size={20} color="#4A86E8" />,
    },
    {
      id: 'entertainment',
      title: 'Entertainment',
      icon: <Gamepad2 size={20} color="#4A86E8" />,
    },
    {
      id: 'device_info',
      title: 'Device Info',
      icon: <Smartphone size={20} color="#4A86E8" />,
    },
    {
      id: 'internet_status',
      title: 'Internet Status',
      icon: <Wifi size={20} color="#4A86E8" />,
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
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
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
    borderRadius: 24,
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#6E7A8A',
    textAlign: 'center',
    fontWeight: '500',
  },
});