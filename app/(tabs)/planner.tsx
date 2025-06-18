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
            icon={<CalendarClock size={50} color="#4A86E8" />}
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
          />
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Plus size={24} color="#fff" />
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
    backgroundColor: '#F9FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskList: {
    paddingBottom: 80,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A86E8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});