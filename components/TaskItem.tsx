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
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 16,
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
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});