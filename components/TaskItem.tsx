import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check, Clock, Flag, MoreHorizontal } from 'lucide-react-native';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const { toggleTaskCompletion } = useTaskStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: task.completed ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [task.completed]);

  const handleToggleComplete = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    toggleTaskCompletion(task.id);
  };

  const priorityColors = {
    low: colors.accent4,
    medium: colors.warning,
    high: colors.error,
  };

  const priorityBgColors = {
    low: colors.accent4 + '20',
    medium: colors.warning + '20',
    high: colors.error + '20',
  };

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={[styles.container, task.completed && styles.completedContainer]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <TouchableOpacity 
          style={[styles.checkbox, task.completed && styles.checkboxChecked]}
          onPress={handleToggleComplete}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.checkIcon,
              {
                opacity: checkAnim,
                transform: [
                  {
                    scale: checkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Check size={16} color={colors.text} strokeWidth={3} />
          </Animated.View>
          {!task.completed && <View style={styles.checkboxEmpty} />}
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text 
              style={[styles.title, task.completed && styles.completedTitle]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            
            <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
              <MoreHorizontal size={16} color={colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {task.description ? (
            <Text 
              style={[styles.description, task.completed && styles.completedDescription]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}
          
          <View style={styles.details}>
            {task.time ? (
              <View style={styles.detailItem}>
                <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.detailText}>{task.time}</Text>
              </View>
            ) : null}
            
            <View style={[
              styles.priority, 
              { 
                backgroundColor: priorityBgColors[task.priority],
                borderColor: priorityColors[task.priority] + '40',
              }
            ]}>
              <Flag size={12} color={priorityColors[task.priority]} strokeWidth={2} />
              <Text style={[
                styles.priorityText, 
                { color: priorityColors[task.priority] }
              ]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  completedContainer: {
    opacity: 0.7,
    backgroundColor: colors.surfaceSecondary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkIcon: {
    position: 'absolute',
  },
  checkboxEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 24,
    flex: 1,
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  moreButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '400',
    lineHeight: 22,
  },
  completedDescription: {
    color: colors.textTertiary,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});