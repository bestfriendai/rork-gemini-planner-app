import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Plus, Calendar, CalendarClock } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/EmptyState';
import { DateSelector } from '@/components/DateSelector';
import { AddTaskModal } from '@/components/AddTaskModal';
import { getCurrentDate, getDaysOfWeek } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlannerScreen() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  
  const { tasks } = useTaskStore();
  const router = useRouter();
  
  // Initialize week dates
  useEffect(() => {
    const dates = getDaysOfWeek(new Date());
    setWeekDates(dates);
  }, []);
  
  // Filter tasks for the selected date
  const tasksForSelectedDate = tasks.filter(task => task.date === selectedDate)
    .sort((a, b) => {
      // Sort by time (if available)
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      if (a.time) return -1;
      if (b.time) return 1;
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  
  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      />
      
      <DateSelector
        dates={weekDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      
      <View style={styles.content}>
        {tasksForSelectedDate.length === 0 ? (
          <EmptyState
            title="No Tasks Scheduled"
            message="Add tasks to your planner to stay organized and productive."
            icon={<CalendarClock size={72} color={colors.primary} />}
          />
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
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.addButtonGradient}
        >
          <Plus size={28} color={colors.text} />
        </LinearGradient>
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  taskList: {
    paddingBottom: 120,
  },
  addButton: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  addButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});