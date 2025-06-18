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
import { LinearGradient } from 'expo-linear-gradient';
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
      {priority === value ? (
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          style={styles.priorityButtonGradient}
        >
          <Text style={styles.priorityButtonTextSelected}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <Text style={styles.priorityButtonText}>
          {label}
        </Text>
      )}
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
                      <X size={24} color={colors.text} />
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
                      style={styles.addButton}
                      onPress={handleAddTask}
                      disabled={!title.trim()}
                    >
                      <LinearGradient
                        colors={!title.trim() ? [colors.textQuaternary, colors.textTertiary] : [colors.primary, colors.primaryLight]}
                        style={styles.addButtonGradient}
                      >
                        <Text style={styles.addButtonText}>Add Task</Text>
                      </LinearGradient>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: colors.glass,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  priorityButtonSelected: {
    borderColor: 'transparent',
  },
  priorityButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingVertical: 16,
    textAlign: 'center',
  },
  priorityButtonTextSelected: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 8,
  },
  addButtonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});