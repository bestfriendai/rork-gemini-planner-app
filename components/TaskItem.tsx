import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Clock, Flag } from 'lucide-react-native';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { toggleTaskCompletion } = useTaskStore();

  const priorityColors = {
    low: colors.surfaceSecondary,
    medium: colors.warning + '15',
    high: colors.error + '15',
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
      <TouchableOpacity 
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={() => toggleTaskCompletion(task.id)}
      >
        {task.completed ? (
          <Check size={10} color={colors.text} strokeWidth={2} />
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
              <Clock size={8} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>{task.time}</Text>
            </View>
          ) : null}
          
          <View style={[
            styles.priority, 
            { backgroundColor: priorityColors[task.priority] }
          ]}>
            <Flag size={6} color={priorityTextColors[task.priority]} strokeWidth={1.5} />
            <Text style={[
              styles.priorityText, 
              { color: priorityTextColors[task.priority] }
            ]}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderWidth: 0,
  },
  checkboxEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '400',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  detailText: {
    fontSize: 9,
    color: colors.textSecondary,
    marginLeft: 3,
    fontWeight: '500',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 2,
  },
});