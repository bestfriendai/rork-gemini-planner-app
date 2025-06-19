import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/EmptyState';
import { AddTaskModal } from '@/components/AddTaskModal';
import { getCurrentDate, getDaysOfWeek, formatDateForDisplay } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function AgendaScreen() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const router = useRouter();
  
  const { tasks } = useTaskStore();
  
  const calendarHeight = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    const dates = getDaysOfWeek(new Date());
    setWeekDates(dates);
  }, []);

  useEffect(() => {
    Animated.timing(calendarHeight, {
      toValue: calendarExpanded ? 120 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [calendarExpanded]);

  const tasksForSelectedDate = tasks.filter(task => task.date === selectedDate)
    .sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      if (a.time) return -1;
      if (b.time) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const upcomingTasks = tasks.filter(task => task.date > selectedDate && !task.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  const toggleCalendar = () => {
    setCalendarExpanded(!calendarExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateTitle}>{formatDateForDisplay(selectedDate)}</Text>
        <TouchableOpacity onPress={toggleCalendar} style={styles.toggleButton}>
          {calendarExpanded ? (
            <ChevronUp size={20} color={colors.textSecondary} strokeWidth={2} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.calendarContainer, { height: calendarHeight }]}>
        {calendarExpanded && (
          <View style={styles.calendar}>
            <FlatList
              horizontal
              data={weekDates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const day = new Date(item).getDate();
                const dayName = new Date(item).toLocaleDateString('en-US', { weekday: 'short' });
                const isSelected = item === selectedDate;
                return (
                  <TouchableOpacity
                    style={[styles.dateItem, isSelected && styles.selectedDateItem]}
                    onPress={() => setSelectedDate(item)}
                  >
                    <Text style={[styles.dayName, isSelected && styles.selectedText]}>{dayName}</Text>
                    <Text style={[styles.dayNumber, isSelected && styles.selectedText]}>{day}</Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={styles.dateList}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </Animated.View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tasks for Today</Text>
        {tasksForSelectedDate.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={tasksForSelectedDate}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem 
                task={item} 
                onPress={() => handleTaskPress(item.id)}
              />
            )}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {upcomingTasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
            <FlatList
              data={upcomingTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TaskItem 
                  task={item} 
                  onPress={() => handleTaskPress(item.id)}
                />
              )}
              contentContainerStyle={styles.taskList}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Plus size={22} color={colors.text} strokeWidth={2} />
      </TouchableOpacity>
      
      <AddTaskModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        date={selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  calendar: {
    padding: 16,
  },
  dateList: {
    paddingRight: 16,
  },
  dateItem: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  selectedDateItem: {
    backgroundColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  selectedText: {
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  taskList: {
    paddingBottom: 120,
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});