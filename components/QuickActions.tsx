import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { 
  Clock, Calendar, CloudSun, Newspaper, CheckSquare, Bell, Calculator, MapPin, 
  TrendingUp, DollarSign, Zap, Brain
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const actions = [
    {
      id: 'current_time',
      title: 'Time',
      icon: <Clock size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.accent3,
      gradient: true,
    },
    {
      id: 'today_date',
      title: 'Date',
      icon: <Calendar size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.accent4,
      gradient: true,
    },
    {
      id: 'weather',
      title: 'Weather',
      icon: <CloudSun size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.accent5,
      gradient: true,
    },
    {
      id: 'news',
      title: 'News',
      icon: <Newspaper size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.accent1,
      gradient: true,
    },
    {
      id: 'stocks',
      title: 'Stocks',
      icon: <TrendingUp size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.success,
      gradient: true,
    },
    {
      id: 'crypto',
      title: 'Crypto',
      icon: <DollarSign size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.warning,
      gradient: true,
    },
    {
      id: 'calculate',
      title: 'Calculate',
      icon: <Calculator size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.accent6,
      gradient: true,
    },
    {
      id: 'location',
      title: 'Location',
      icon: <MapPin size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.accent2,
      gradient: true,
    },
    {
      id: 'schedule',
      title: 'Plan Day',
      icon: <Brain size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.primary,
      gradient: true,
    },
    {
      id: 'reminder',
      title: 'Reminder',
      icon: <Bell size={22} color={colors.primary} strokeWidth={2} />,
      color: colors.error,
      gradient: true,
    },
  ];

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Quick Actions</Text>
        <View style={styles.titleIcon}>
          <Zap size={18} color={colors.primary} strokeWidth={2} />
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 30 + index * 5],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onAction(action.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.iconContainer, 
                { 
                  backgroundColor: action.color + '20',
                  borderColor: action.color + '40',
                }
              ]}>
                {action.icon}
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  scrollContent: {
    paddingRight: 16,
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
});