import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { X, Calendar, Clock, Flag, Check } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { getCurrentDate } from '@/utils/dateUtils';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  date?: string;
  initialTitle?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  visible, 
  onClose, 
  date = getCurrentDate(),
  initialTitle = ''
}) => {
  const { addTask } = useTaskStore();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [taskDate, setTaskDate] = useState(date);
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSave = () => {
    if (title.trim()) {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date: taskDate,
        time: time || undefined,
        completed: false,
        priority,
      });
      onClose();
    }
  };

  const priorityColors = {
    low: colors.accent4,
    medium: colors.warning,
    high: colors.error,
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.form}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What do you need to do?"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details about your task"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <Text style={styles.label}>Date</Text>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateInput}>
                <Calendar size={16} color={colors.textSecondary} strokeWidth={2} />
                <TextInput
                  style={styles.dateTextInput}
                  value={taskDate}
                  onChangeText={setTaskDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              
              <View style={styles.timeInput}>
                <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
                <TextInput
                  style={styles.timeTextInput}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>
            
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <TouchableOpacity
                style={[
                  styles.priorityButton, 
                  priority === 'low' && styles.priorityButtonSelected,
                  { borderColor: priorityColors.low }
                ]}
                onPress={() => setPriority('low')}
              >
                <Flag size={14} color={priorityColors.low} strokeWidth={2} />
                <Text style={[styles.priorityText, { color: priorityColors.low }]}>Low</Text>
                {priority === 'low' && (
                  <View style={styles.priorityCheck}>
                    <Check size={10} color={colors.text} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.priorityButton, 
                  priority === 'medium' && styles.priorityButtonSelected,
                  { borderColor: priorityColors.medium }
                ]}
                onPress={() => setPriority('medium')}
              >
                <Flag size={14} color={priorityColors.medium} strokeWidth={2} />
                <Text style={[styles.priorityText, { color: priorityColors.medium }]}>Medium</Text>
                {priority === 'medium' && (
                  <View style={styles.priorityCheck}>
                    <Check size={10} color={colors.text} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.priorityButton, 
                  priority === 'high' && styles.priorityButtonSelected,
                  { borderColor: priorityColors.high }
                ]}
                onPress={() => setPriority('high')}
              >
                <Flag size={14} color={priorityColors.high} strokeWidth={2} />
                <Text style={[styles.priorityText, { color: priorityColors.high }]}>High</Text>
                {priority === 'high' && (
                  <View style={styles.priorityCheck}>
                    <Check size={10} color={colors.text} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginRight: 8,
  },
  timeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  timeTextInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    backgroundColor: colors.surfaceSecondary,
    position: 'relative',
  },
  priorityButtonSelected: {
    backgroundColor: colors.primaryMuted,
  },
  priorityText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  priorityCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceTertiary,
    opacity: 0.5,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 15,
  },
  saveButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
});