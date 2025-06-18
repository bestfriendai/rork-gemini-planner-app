import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/EmptyState';
import { AddTaskModal } from '@/components/AddTaskModal';
import { getCurrentDate } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function TasksScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  
  const { tasks } = useTaskStore();
  const router = useRouter();
  
  const today = getCurrentDate();
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'today') return task.date === today;
    if (filter === 'upcoming') return task.date > today;
    if (filter === 'completed') return task.completed;
    return true;
  }).sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    if (a.time) return -1;
    if (b.time) return 1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const handleTaskPress = (taskId: string) => {
    router.push(`/task/${taskId}`);
  };
  
  const FilterButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FilterButton value="all" label="All" />
        <FilterButton value="today" label="Today" />
        <FilterButton value="upcoming" label="Upcoming" />
        <FilterButton value="completed" label="Completed" />
      </View>
      
      <View style={styles.content}>
        {filteredTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={filteredTasks}
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
        <Plus size={18} color={colors.text} strokeWidth={1.5} />
      </TouchableOpacity>
      
      <AddTaskModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        date={today}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskList: {
    paddingBottom: 100,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});