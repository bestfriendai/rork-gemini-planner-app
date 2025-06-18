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
import { colors } from '@/constants/colors';
import { BlurView } from 'expo-blur';

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
      ]}
      onPress={() => setPriority(value)}
    >
      <Text style={[
        styles.priorityButtonText,
        priority === value && styles.priorityButtonTextSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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
              <BlurView intensity={100} style={styles.modalBlur}>
                <View style={styles.modalContent}>
                  <View style={styles.header}>
                    <Text style={styles.headerTitle}>Add New Task</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <X size={20} color={colors.text} />
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
                        placeholderTextColor={colors.textTertiary}
                      />
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Description (optional)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add details about your task"
                        placeholderTextColor={colors.textTertiary}
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
                        placeholderTextColor={colors.textTertiary}
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
                      style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
                      onPress={handleAddTask}
                      disabled={!title.trim()}
                    >
                      <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: colors.glass,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: '500',
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
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priorityButtonTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});