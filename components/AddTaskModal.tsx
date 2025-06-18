import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';

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
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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

  const PriorityButton = ({ value, label }: { value: 'low' | 'medium' | 'high', label: string }) => {
    const priorityColors = {
      low: colors.primary,
      medium: colors.warning,
      high: colors.error,
    };

    return (
      <TouchableOpacity
        style={[
          styles.priorityButton,
          priority === value && [
            styles.priorityButtonSelected,
            { backgroundColor: priorityColors[value] + '20', borderColor: priorityColors[value] }
          ],
        ]}
        onPress={() => setPriority(value)}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.priorityButtonText,
          priority === value && [
            styles.priorityButtonTextSelected,
            { color: priorityColors[value] }
          ],
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Add New Task</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
                    <X size={22} color={colors.text} strokeWidth={2} />
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
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addButtonText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  form: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: '400',
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
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderWidth: 2,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  priorityButtonTextSelected: {
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});