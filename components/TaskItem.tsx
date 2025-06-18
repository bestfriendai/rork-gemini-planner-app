import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Clock, Flag } from 'lucide-react-native';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { toggleTaskCompletion } = useTaskStore();

  const priorityColors = {
    low: colors.surfaceSecondary,
    medium: colors.warning + '20',
    high: colors.error + '20',
  };

  const priorityTextColors = {
    low: colors.primary,
    medium: colors.warning,
    high: colors.error,
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[colors.surface, colors.surfaceSecondary]}
        style={styles.gradient}
      >
        <TouchableOpacity 
          style={[styles.checkbox, task.completed && styles.checkboxChecked]}
          onPress={() => toggleTaskCompletion(task.id)}
        >
          {task.completed ? (
            <LinearGradient
              colors={[colors.success, '#4AE54A']}
              style={styles.checkboxGradient}
            >
              <Check size={16} color={colors.text} />
            </LinearGradient>
          ) : (
            <View style={styles.checkboxEmpty} />
          )}
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Text 
            style={[styles.title, task.completed && styles.completedTitle]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {task.description ? (
            <Text 
              style={styles.description}
              numberOfLines={1}
            >
              {task.description}
            </Text>
          ) : null}
          
          <View style={styles.details}>
            {task.time ? (
              <View style={styles.detailItem}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={styles.detailText}>{task.time}</Text>
              </View>
            ) : null}
            
            <View style={[
              styles.priority, 
              { backgroundColor: priorityColors[task.priority] }
            ]}>
              <Flag size={12} color={priorityTextColors[task.priority]} />
              <Text style={[
                styles.priorityText, 
                { color: priorityTextColors[task.priority] }
              ]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    flexDirection: 'row',
    padding: 20,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkboxChecked: {
    borderWidth: 0,
  },
  checkboxEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkboxGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '700',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});