import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Calendar, Flag, Trash2, Edit2, Save } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { formatDateForDisplay } from '@/utils/dateUtils';

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
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
    low: '#E8F1FF',
    medium: '#FFF8E8',
    high: '#FFEBEE',
  };

  const priorityTextColors = {
    low: '#4A86E8',
    medium: '#F9A826',
    high: '#FF3B30',
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.editLabel}>Title</Text>
            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
              placeholderTextColor="#A0A9B8"
            />
            
            <Text style={styles.editLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Add details about your task"
              placeholderTextColor="#A0A9B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setEditTitle(task.title);
                  setEditDescription(task.description || '');
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={!editTitle.trim()}
              >
                <Save size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{task.title}</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit2 size={18} color="#4A86E8" />
              </TouchableOpacity>
            </View>
            
            {task.description ? (
              <Text style={styles.description}>{task.description}</Text>
            ) : null}
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Calendar size={18} color="#6E7A8A" />
                <Text style={styles.detailText}>
                  {formatDateForDisplay(task.date)}
                </Text>
              </View>
              
              {task.time ? (
                <View style={styles.detailItem}>
                  <Clock size={18} color="#6E7A8A" />
                  <Text style={styles.detailText}>{task.time}</Text>
                </View>
              ) : null}
              
              <View style={[
                styles.priority, 
                { backgroundColor: priorityColors[task.priority] }
              ]}>
                <Flag size={14} color={priorityTextColors[task.priority]} />
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
          style={[
            styles.actionButton, 
            styles.completeButton,
            task.completed && styles.uncompleteButton
          ]}
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
          <Trash2 size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Delete Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 20,
    lineHeight: 24,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#6E7A8A',
    marginLeft: 10,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  actions: {
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  uncompleteButton: {
    backgroundColor: '#6E7A8A',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4A86E8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  editContainer: {
    padding: 4,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#F9FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    marginBottom: 16,
  },
  editTextArea: {
    minHeight: 100,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F9FAFC',
  },
  saveButton: {
    backgroundColor: '#4A86E8',
  },
  cancelButtonText: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 6,
  },
});