import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Calendar, Flag, Trash2, Edit2, Save } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

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
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={styles.backgroundGradient}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.backButtonGradient}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </LinearGradient>
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
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      />
      
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
                  <LinearGradient
                    colors={[colors.primary, colors.primaryLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Save size={16} color={colors.text} />
                    <Text style={styles.saveButtonText}>Save</Text>
                  </LinearGradient>
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
                  <Edit2 size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : null}
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Calendar size={20} color={colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {formatDateForDisplay(task.date)}
                  </Text>
                </View>
                
                {task.time ? (
                  <View style={styles.detailItem}>
                    <Clock size={20} color={colors.textSecondary} />
                    <Text style={styles.detailText}>{task.time}</Text>
                  </View>
                ) : null}
                
                <View style={[
                  styles.priority, 
                  { backgroundColor: priorityColors[task.priority] }
                ]}>
                  <Flag size={16} color={priorityTextColors[task.priority]} />
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
            style={styles.actionButton}
            onPress={handleToggleComplete}
          >
            <LinearGradient
              colors={task.completed ? [colors.textQuaternary, colors.textTertiary] : [colors.success, '#4AE54A']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>
                {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
          >
            <LinearGradient
              colors={[colors.error, '#FF6B6B']}
              style={styles.actionButtonGradient}
            >
              <Trash2 size={18} color={colors.text} />
              <Text style={styles.actionButtonText}>Delete Task</Text>
            </LinearGradient>
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
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
    letterSpacing: -0.8,
  },
  editIconButton: {
    padding: 8,
  },
  description: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 26,
    fontWeight: '500',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
    fontWeight: '600',
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  actions: {
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  errorText: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '800',
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  editContainer: {
    padding: 4,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  editInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 20,
    fontWeight: '500',
  },
  editTextArea: {
    minHeight: 120,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '800',
    marginLeft: 6,
  },
});