import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, CheckCircle, Clock, Award } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { getCurrentDate } from '@/utils/dateUtils';

export default function InsightsScreen() {
  const { tasks } = useTaskStore();
  const [completionRate, setCompletionRate] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [mostActiveDay, setMostActiveDay] = useState<string>('N/A');
  const [categoryStats, setCategoryStats] = useState<{category: string, count: number, completed: number}[]>([]);

  const today = getCurrentDate();

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const calculateStats = () => {
    if (tasks.length === 0) return;

    // Completion Rate
    const completedTasks = tasks.filter(t => t.completed).length;
    const rate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    setCompletionRate(Math.round(rate));

    // Current Streak (simplified: consecutive days with completed tasks)
    let streak = 0;
    let currentDate = new Date(today);
    const completedDates = [...new Set(tasks.filter(t => t.completed).map(t => t.date))].sort().reverse();
    
    for (let i = 0; i < completedDates.length; i++) {
      const date = new Date(completedDates[i]);
      if (i === 0 && date.toISOString().split('T')[0] === today) {
        streak++;
      } else if (i > 0) {
        const prevDate = new Date(completedDates[i - 1]);
        const diffDays = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    setCurrentStreak(streak);

    // Most Active Day
    const taskDates = tasks.map(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' }));
    const dayCounts: {[key: string]: number} = {};
    taskDates.forEach(day => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    let maxDay = 'N/A';
    let maxCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxDay = day;
        maxCount = count;
      }
    });
    setMostActiveDay(maxDay);

    // Category Stats (mock categories for now)
    const categories = {
      Work: { count: 0, completed: 0 },
      Personal: { count: 0, completed: 0 },
      Health: { count: 0, completed: 0 },
    };
    tasks.forEach((task, index) => {
      const cat = index % 3 === 0 ? 'Work' : index % 3 === 1 ? 'Personal' : 'Health';
      categories[cat].count++;
      if (task.completed) categories[cat].completed++;
    });
    setCategoryStats(Object.entries(categories).map(([cat, data]) => ({
      category: cat,
      count: data.count,
      completed: data.completed,
    })));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Your Productivity Insights</Text>
        <Text style={styles.subtitle}>Here&apos;s how you&apos;re doing based on your activity</Text>
        
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <View style={styles.iconWrapper}>
              <CheckCircle size={24} color={colors.success} strokeWidth={2} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewValue}>{completionRate}%</Text>
              <Text style={styles.overviewLabel}>Completion Rate</Text>
            </View>
          </View>
          
          <View style={styles.overviewCard}>
            <View style={styles.iconWrapper}>
              <Award size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewValue}>{currentStreak}</Text>
              <Text style={styles.overviewLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={styles.overviewCard}>
            <View style={styles.iconWrapper}>
              <Clock size={24} color={colors.warning} strokeWidth={2} />
            </View>
            <View style={styles.overviewContent}>
              <Text style={styles.overviewValue}>{mostActiveDay}</Text>
              <Text style={styles.overviewLabel}>Most Active Day</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {categoryStats.map((stat, index) => (
            <View key={index} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{stat.category}</Text>
              <View style={styles.categoryProgressContainer}>
                <View style={[styles.categoryProgress, { width: `${(stat.completed / Math.max(stat.count, 1)) * 100}%` }]} />
              </View>
              <Text style={styles.categoryStats}>{stat.completed}/{stat.count}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '40%' }]} />
              <Text style={styles.dayLabel}>Mon</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '60%' }]} />
              <Text style={styles.dayLabel}>Tue</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '80%' }]} />
              <Text style={styles.dayLabel}>Wed</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '50%' }]} />
              <Text style={styles.dayLabel}>Thu</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '70%' }]} />
              <Text style={styles.dayLabel}>Fri</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '30%' }]} />
              <Text style={styles.dayLabel}>Sat</Text>
            </View>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: '90%' }]} />
              <Text style={styles.dayLabel}>Sun</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementContainer}>
            <View style={styles.achievement}>
              <View style={styles.achievementIcon}>
                <TrendingUp size={24} color={colors.success} strokeWidth={2} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Productivity Pro</Text>
                <Text style={styles.achievementDescription}>Completed 10 tasks in a day</Text>
              </View>
            </View>
            <View style={styles.achievement}>
              <View style={styles.achievementIcon}>
                <Award size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Streak Master</Text>
                <Text style={styles.achievementDescription}>Maintained a 7-day streak</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips from Jarva</Text>
          <TouchableOpacity style={styles.tipButton}>
            <Text style={styles.tipButtonText}>Ask Jarva for productivity tips</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 24,
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  overviewCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overviewContent: {
    flex: 1,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  overviewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    flex: 2,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  categoryProgressContainer: {
    flex: 3,
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  categoryProgress: {
    height: '100%',
    backgroundColor: colors.success,
  },
  categoryStats: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 16,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  achievementContainer: {
    marginTop: 8,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: colors.surfaceSecondary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tipButton: {
    backgroundColor: colors.primaryMuted,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  tipButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});