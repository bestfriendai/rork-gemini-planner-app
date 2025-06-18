import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { Plus, CheckSquare, Filter } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/EmptyState';
import { AddTaskModal } from '@/components/AddTaskModal';
import { getCurrentDate } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function TasksScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  
  const { tasks } = useTaskStore();
  const router = useRouter();
  
  const today = getCurrentDate();
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'today') return task.date === today;
    if (filter === 'upcoming') return task.date > today;
    if (filter === 'completed') return task.completed;
    return true;
  }).sort((a, b) => {
    // Sort by date first
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    
    // Then by time (if available)
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
  
  const FilterButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive
      ]}
      onPress={() => setFilter(value)}
    >
      {filter === value ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.filterButtonGradient}
        >
          <Text style={styles.filterButtonTextActive}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <Text style={styles.filterButtonText}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      />
      
      <View style={styles.filterContainer}>
        <FilterButton value="all" label="All" />
        <FilterButton value="today" label="Today" />
        <FilterButton value="upcoming" label="Upcoming" />
        <FilterButton value="completed" label="Completed" />
      </View>
      
      <View style={styles.content}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No Tasks Found"
            message={`You don't have any ${filter} tasks. Add some to stay organized.`}
            icon={<CheckSquare size={72} color={colors.primary} />}
          />
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
  },
  filterButtonActive: {
    backgroundColor: 'transparent',
  },
  filterButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
    paddingVertical: 12,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
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