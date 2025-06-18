import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Clock, Flag, Calendar, MapPin, Tag, Repeat, Timer } from 'lucide-react-native';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { toggleTaskCompletion, categories } = useTaskStore();

  const priorityColors = {
    low: colors.primary + '20',
    medium: colors.warning + '20',
    high: colors.error + '20',
  };

  const priorityTextColors = {
    low: colors.primary,
    medium: colors.warning,
    high: colors.error,
  };
  
  const priorityBorderColors = {
    low: colors.primary,
    medium: colors.warning,
    high: colors.error,
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { borderLeftColor: priorityBorderColors[task.priority] }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={[styles.checkbox, task.completed && styles.checkboxChecked]}
        onPress={() => toggleTaskCompletion(task.id)}
      >
        {task.completed ? (
          <Check size={14} color={colors.text} strokeWidth={2} />
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
          {task.date && !isToday(task.date) ? (
            <View style={styles.detailItem}>
              <Calendar size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>{formatDate(task.date)}</Text>
            </View>
          ) : null}
          
          {task.time ? (
            <View style={styles.detailItem}>
              <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>{task.time}</Text>
            </View>
          ) : null}
          
          {task.estimatedDuration ? (
            <View style={styles.detailItem}>
              <Timer size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>{task.estimatedDuration} min</Text>
            </View>
          ) : null}
          
          {task.location ? (
            <View style={styles.detailItem}>
              <MapPin size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText} numberOfLines={1}>{task.location}</Text>
            </View>
          ) : null}
          
          {task.category ? (
            <View style={styles.detailItem}>
              <Tag size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>
                {categories.find(c => c.id === task.category)?.name || 'Category'}
              </Text>
            </View>
          ) : null}
          
          {task.recurrence ? (
            <View style={styles.detailItem}>
              <Repeat size={12} color={colors.textSecondary} strokeWidth={1.5} />
              <Text style={styles.detailText}>
                {`Every ${task.recurrence.interval} ${task.recurrence.frequency}`}
              </Text>
            </View>
          ) : null}
          
          <View style={[
            styles.priority, 
            { backgroundColor: priorityColors[task.priority] }
          ]}>
            <Flag size={10} color={priorityTextColors[task.priority]} strokeWidth={1.5} />
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

// Helper function to check if a date is today
const isToday = (dateString: string) => {
  const today = new Date();
  const date = new Date(dateString);
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Helper function to format date in a more readable way
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16, // Apple uses more rounded corners
    marginBottom: 12,
    marginHorizontal: 16,
    borderLeftWidth: 3, // Slightly thinner accent border
    borderColor: colors.borderLight,
    ...shadows.card, // Using Apple-style card shadow
  },
  checkbox: {
    width: 22, // Slightly smaller for Apple style
    height: 22, // Slightly smaller for Apple style
    borderRadius: 11,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderWidth: 1.5, // Slightly thicker border for Apple style
    borderColor: colors.borderLight,
    backgroundColor: 'transparent', // Apple prefers transparent checkboxes
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: 'transparent', // Apple removes borders when checked
  },
  checkboxEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17, // SF Pro Text size
    fontWeight: '600', // SF Pro Text Semibold
    color: colors.text,
    marginBottom: 4, // Tighter spacing
    letterSpacing: -0.4, // Apple's SF Pro has tighter letter spacing
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 15, // SF Pro Text size
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
    letterSpacing: -0.24, // Apple's SF Pro has tighter letter spacing
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2, // Slight spacing adjustment
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13, // SF Pro Text size
    color: colors.textSecondary,
    marginLeft: 4, // Tighter spacing
    fontWeight: '500', // SF Pro Text Medium
    letterSpacing: -0.08, // Apple's SF Pro has tighter letter spacing
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3, // Slightly smaller
    borderRadius: 12, // More rounded for Apple style
    borderWidth: 0, // Apple typically doesn't use borders here
  },
  priorityText: {
    fontSize: 12, // SF Pro Text size
    fontWeight: '600', // SF Pro Text Semibold
    marginLeft: 4,
    letterSpacing: -0.08, // Apple's SF Pro has tighter letter spacing
  },
});