import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { TrendingUp, CheckCircle, Clock } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';

export default function InsightsScreen() {
  const { tasks } = useTaskStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  const priorityStats = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Productivity Insights</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Total Tasks</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CheckCircle size={24} color={colors.success} strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{completedTasks.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={24} color={colors.warning} strokeWidth={2} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{pendingTasks.length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Completion Rate</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${completionRate}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(completionRate)}% Complete</Text>
          </View>
          
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Priority Distribution</Text>
            <View style={styles.priorityBars}>
              <View style={styles.priorityBarItem}>
                <View style={[styles.priorityBar, { height: `${(priorityStats.high / Math.max(tasks.length, 1)) * 100}%`, backgroundColor: colors.error }]} />
                <Text style={styles.priorityCount}>{priorityStats.high}</Text>
                <Text style={styles.priorityLabel}>High</Text>
              </View>
              
              <View style={styles.priorityBarItem}>
                <View style={[styles.priorityBar, { height: `${(priorityStats.medium / Math.max(tasks.length, 1)) * 100}%`, backgroundColor: colors.warning }]} />
                <Text style={styles.priorityCount}>{priorityStats.medium}</Text>
                <Text style={styles.priorityLabel}>Medium</Text>
              </View>
              
              <View style={styles.priorityBarItem}>
                <View style={[styles.priorityBar, { height: `${(priorityStats.low / Math.max(tasks.length, 1)) * 100}%`, backgroundColor: colors.accent4 }]} />
                <Text style={styles.priorityCount}>{priorityStats.low}</Text>
                <Text style={styles.priorityLabel}>Low</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>Productivity Tips</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Prioritize High-Impact Tasks</Text>
              <Text style={styles.tipDescription}>Focus on completing high-priority tasks first to maximize your impact.</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Break Down Complex Tasks</Text>
              <Text style={styles.tipDescription}>Divide large tasks into smaller, manageable subtasks to avoid feeling overwhelmed.</Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Review Daily</Text>
              <Text style={styles.tipDescription}>Spend a few minutes each evening planning the next day for better focus.</Text>
            </View>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    paddingLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  priorityBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 160,
    marginBottom: 8,
  },
  priorityBarItem: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  priorityBar: {
    width: 40,
    borderRadius: 4,
  },
  priorityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
    marginBottom: 2,
  },
  priorityLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tipsContainer: {
    marginBottom: 40,
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },
});