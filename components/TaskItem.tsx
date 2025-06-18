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
      <TouchableOpacity 
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={() => toggleTaskCompletion(task.id)}
      >
        {task.completed ? (
          <Check size={12} color={colors.text} strokeWidth={2} />
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
              <Clock size={10} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>{task.time}</Text>
            </View>
          ) : null}
          
          <View style={[
            styles.priority, 
            { backgroundColor: priorityColors[task.priority] }
          ]}>
            <Flag size={8} color={priorityTextColors[task.priority]} strokeWidth={1.5} />
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
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderWidth: 0,
  },
  checkboxEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '400',
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
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
});