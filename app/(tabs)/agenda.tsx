import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DateSelector } from '@/components/DateSelector';
import { TaskItem } from '@/components/TaskItem';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { getCurrentDate, getDaysOfWeek } from '@/utils/dateUtils';

export default function AgendaScreen() {
  const { tasks, addTask } = useTaskStore();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [dates, setDates] = useState<string[]>(getDaysOfWeek(new Date()));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredTasks = tasks.filter(task => task.date === selectedDate);

  const handleAddTask = () => {
    addTask({
      title: "New Task",
      date: selectedDate,
      completed: false,
      priority: 'medium',
    });
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };

  return (
    <View style={styles.container}>
      <DateSelector 
        dates={dates} 
        selectedDate={selectedDate} 
        onSelectDate={setSelectedDate} 
      />
      
      <ScrollView style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks for this day</Text>
              <TouchableOpacity 
                style={styles.addButtonEmpty} 
                onPress={handleAddTask}
              >
                <Plus size={16} color={colors.text} strokeWidth={2} />
                <Text style={styles.addButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.taskCount}>
                {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
              </Text>
              
              {filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onPress={() => handleTaskPress(task.id)} 
                />
              ))}
            </>
          )}
        </Animated.View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleAddTask}
      >
        <Plus size={24} color={colors.text} strokeWidth={2} />
      </TouchableOpacity>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  addButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  taskCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    paddingLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
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