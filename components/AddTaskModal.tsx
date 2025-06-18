import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  visible, 
  onClose,
  date,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const { addTask } = useTaskStore();

  const handleAddTask = () => {
    if (title.trim()) {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time: time.trim() || undefined,
        completed: false,
        priority,
      });
      
      // Reset form and close modal
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime('');
    setPriority('medium');
  };

  const PriorityButton = ({ value, label }: { value: 'low' | 'medium' | 'high', label: string }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === value && styles.priorityButtonSelected,
        priority === value && { backgroundColor: getPriorityColor(value) }
      ]}
      onPress={() => setPriority(value)}
    >
      <Text 
        style={[
          styles.priorityButtonText,
          priority === value && styles.priorityButtonTextSelected
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getPriorityColor = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'low': return '#E8F1FF';
      case 'medium': return '#FFF8E8';
      case 'high': return '#FFEBEE';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Add New Task</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={24} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.form}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Task title"
                      placeholderTextColor="#A0A9B8"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description (optional)</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Add details about your task"
                      placeholderTextColor="#A0A9B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Time (optional)</Text>
                    <TextInput
                      style={styles.input}
                      value={time}
                      onChangeText={setTime}
                      placeholder="e.g. 14:30"
                      placeholderTextColor="#A0A9B8"
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityButtons}>
                      <PriorityButton value="low" label="Low" />
                      <PriorityButton value="medium" label="Medium" />
                      <PriorityButton value="high" label="High" />
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddTask}
                    disabled={!title.trim()}
                  >
                    <Text style={styles.addButtonText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  textArea: {
    minHeight: 80,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  priorityButtonSelected: {
    borderColor: 'transparent',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6E7A8A',
  },
  priorityButtonTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4A86E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});