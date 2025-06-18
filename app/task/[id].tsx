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
    medium: colors.warning + '20',
    high: colors.error + '20',
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
                  <Save size={14} color={colors.text} strokeWidth={1.5} />
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
                  <Edit2 size={18} color={colors.primary} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
              
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : null}
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Calendar size={16} color={colors.textSecondary} strokeWidth={1.5} />
                  <Text style={styles.detailText}>
                    {formatDateForDisplay(task.date)}
                  </Text>
                </View>
                
                {task.time ? (
                  <View style={styles.detailItem}>
                    <Clock size={16} color={colors.textSecondary} strokeWidth={1.5} />
                    <Text style={styles.detailText}>{task.time}</Text>
                  </View>
                ) : null}
                
                <View style={[
                  styles.priority, 
                  { backgroundColor: priorityColors[task.priority] }
                ]}>
                  <Flag size={12} color={priorityTextColors[task.priority]} strokeWidth={1.5} />
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
            <Trash2 size={16} color={colors.text} strokeWidth={1.5} />
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
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  editIconButton: {
    padding: 4,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: '400',
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actions: {
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
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
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  editContainer: {
    padding: 4,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 16,
    fontWeight: '400',
  },
  editTextArea: {
    minHeight: 80,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 13,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
});