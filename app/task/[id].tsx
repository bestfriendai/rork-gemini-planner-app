import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Calendar, Flag, Trash2, Edit2, Save } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, updateTask, deleteTask } = useTaskStore();
  
  const task = tasks.find(t => t.id === id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task?.title || '');
  const [editDescription, setEditDescription] = useState(task?.description || '');
  
  if (!task) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteTask(task.id);
            router.back();
          }
        }
      ]
    );
  };
  
  const handleToggleComplete = () => {
    updateTask(task.id, { completed: !task.completed });
  };
  
  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };
  
  const priorityColors = {
    low: colors.surfaceSecondary,
    medium: colors.warning + '15',
    high: colors.error + '15',
  };

  const priorityTextColors = {
    low: colors.primary,
    medium: colors.warning,
    high: colors.error,
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <Text style={styles.editLabel}>Title</Text>
              <TextInput
                style={styles.editInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Task title"
                placeholderTextColor={colors.textTertiary}
              />
              
              <Text style={styles.editLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Add details about your task"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.editButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditTitle(task.title);
                    setEditDescription(task.description || '');
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveEdit}
                  disabled={!editTitle.trim()}
                >
                  <Save size={10} color={colors.text} strokeWidth={1.5} />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>{task.title}</Text>
                <TouchableOpacity 
                  style={styles.editIconButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Edit2 size={14} color={colors.primary} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
              
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : null}
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Calendar size={12} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.detailText}>
                    {formatDateForDisplay(task.date)}
                  </Text>
                </View>
                
                {task.time ? (
                  <View style={styles.detailItem}>
                    <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
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
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, task.completed ? styles.incompleteButton : styles.completeButton]}
            onPress={handleToggleComplete}
          >
            <Text style={styles.actionButtonText}>
              {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Trash2 size={12} color={colors.text} strokeWidth={1.5} />
            <Text style={styles.actionButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  editIconButton: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  detailsContainer: {
    marginTop: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  actions: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  incompleteButton: {
    backgroundColor: colors.textQuaternary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  editContainer: {
    padding: 2,
  },
  editLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 12,
    fontWeight: '400',
  },
  editTextArea: {
    minHeight: 80,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 6,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 11,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 3,
    fontSize: 11,
  },
});