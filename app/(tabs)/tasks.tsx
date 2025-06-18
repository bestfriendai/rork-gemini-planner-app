import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Platform } from 'react-native';
import { Plus, LayoutGrid, List } from 'lucide-react-native';
import { shadows } from '@/utils/shadowUtils';
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
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  
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
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <FilterButton value="all" label="All" />
          <FilterButton value="today" label="Today" />
          <FilterButton value="upcoming" label="Upcoming" />
          <FilterButton value="completed" label="Completed" />
        </View>
        <TouchableOpacity style={styles.viewModeButton} onPress={() => setViewMode(viewMode === 'list' ? 'board' : 'list')}>
          {viewMode === 'list' ? <LayoutGrid size={20} color={colors.primary} /> : <List size={20} color={colors.primary} />}
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {filteredTasks.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'list' ? (
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
        ) : (
          <View style={styles.boardPlaceholder}>
            <Text style={styles.boardPlaceholderText}>Kanban Board View Coming Soon!</Text>
            <Text style={styles.boardPlaceholderSubtext}>This will show your tasks in columns like To Do, In Progress, and Done.</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  filterContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    paddingRight: 8,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
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
    paddingBottom: 120,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  boardPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  boardPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  boardPlaceholderSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
    ...shadows.large,
  },
});