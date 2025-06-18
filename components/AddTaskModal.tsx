import React, { useState, useEffect } from 'react';
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
  ScrollView,
  Switch,
} from 'react-native';
import { 
  X, 
  Clock, 
  AlignLeft, 
  Flag, 
  MapPin, 
  Tag, 
  Repeat, 
  Timer, 
  Bell, 
  Folder 
} from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
  projectId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ 
  visible, 
  onClose,
  date,
  projectId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  
  // Recurrence settings
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState('');
  
  // Advanced options toggle
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  const { addTask, categories } = useTaskStore();

  const handleAddTask = () => {
    if (title.trim()) {
      const newTask = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time: time.trim() || undefined,
        completed: false,
        priority,
        category,
        projectId,
        location: location.trim() || undefined,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        reminderTime: reminderTime ? parseInt(reminderTime) : undefined,
      };
      
      // Add recurrence information if enabled
      if (isRecurring) {
        newTask.recurrence = {
          frequency: recurrenceFrequency,
          interval: parseInt(recurrenceInterval) || 1,
          endDate: recurrenceEndDate || undefined,
          occurrences: recurrenceOccurrences ? parseInt(recurrenceOccurrences) : undefined,
        };
      }
      
      addTask(newTask);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTime('');
    setPriority('medium');
    setCategory(undefined);
    setLocation('');
    setEstimatedDuration('');
    setReminderTime('');
    setIsRecurring(false);
    setRecurrenceFrequency('daily');
    setRecurrenceInterval('1');
    setRecurrenceEndDate('');
    setRecurrenceOccurrences('');
    setShowAdvancedOptions(false);
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

  const CategoryButton = ({ id, name, color }: { id: string, name: string, color: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        { borderColor: color },
        category === id && { backgroundColor: color + '20' }
      ]}
      onPress={() => setCategory(id)}
    >
      <Text style={[
        styles.categoryButtonText,
        { color: color },
      ]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
  
  const RecurrenceButton = ({ value, label }: { value: 'daily' | 'weekly' | 'monthly' | 'yearly', label: string }) => (
    <TouchableOpacity
      style={[
        styles.recurrenceButton,
        recurrenceFrequency === value && styles.recurrenceButtonSelected,
      ]}
      onPress={() => setRecurrenceFrequency(value)}
    >
      <Text style={[
        styles.recurrenceButtonText,
        recurrenceFrequency === value && styles.recurrenceButtonTextSelected,
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
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Add New Task</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <X size={20} color={colors.text} strokeWidth={1.5} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.scrollView}>
                  <View style={styles.form}>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Title</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          value={title}
                          onChangeText={setTitle}
                          placeholder="Task title"
                          placeholderTextColor={colors.textTertiary}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Description (optional)</Text>
                      <View style={styles.inputContainer}>
                        <AlignLeft size={16} color={colors.textTertiary} style={styles.inputIcon} />
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
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Time (optional)</Text>
                      <View style={styles.inputContainer}>
                        <Clock size={16} color={colors.textTertiary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          value={time}
                          onChangeText={setTime}
                          placeholder="e.g. 14:30"
                          placeholderTextColor={colors.textTertiary}
                          keyboardType="numbers-and-punctuation"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Priority</Text>
                      <View style={styles.inputContainer}>
                        <Flag size={16} color={colors.textTertiary} style={styles.inputIcon} />
                        <View style={styles.priorityButtons}>
                          <PriorityButton value="low" label="Low" />
                          <PriorityButton value="medium" label="Medium" />
                          <PriorityButton value="high" label="High" />
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Category</Text>
                      <View style={styles.inputContainer}>
                        <Tag size={16} color={colors.textTertiary} style={styles.inputIcon} />
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          style={styles.categoriesContainer}
                        >
                          {categories.map((cat) => (
                            <CategoryButton 
                              key={cat.id} 
                              id={cat.id} 
                              name={cat.name} 
                              color={cat.color} 
                            />
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.advancedOptionsToggle}
                      onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      <Text style={styles.advancedOptionsToggleText}>
                        {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                      </Text>
                    </TouchableOpacity>
                    
                    {showAdvancedOptions && (
                      <>
                        <View style={styles.formGroup}>
                          <Text style={styles.label}>Location (optional)</Text>
                          <View style={styles.inputContainer}>
                            <MapPin size={16} color={colors.textTertiary} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              value={location}
                              onChangeText={setLocation}
                              placeholder="Add a location"
                              placeholderTextColor={colors.textTertiary}
                            />
                          </View>
                        </View>
                        
                        <View style={styles.formGroup}>
                          <Text style={styles.label}>Estimated Duration (minutes)</Text>
                          <View style={styles.inputContainer}>
                            <Timer size={16} color={colors.textTertiary} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              value={estimatedDuration}
                              onChangeText={setEstimatedDuration}
                              placeholder="e.g. 30"
                              placeholderTextColor={colors.textTertiary}
                              keyboardType="number-pad"
                            />
                          </View>
                        </View>
                        
                        <View style={styles.formGroup}>
                          <Text style={styles.label}>Reminder (minutes before)</Text>
                          <View style={styles.inputContainer}>
                            <Bell size={16} color={colors.textTertiary} style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              value={reminderTime}
                              onChangeText={setReminderTime}
                              placeholder="e.g. 15"
                              placeholderTextColor={colors.textTertiary}
                              keyboardType="number-pad"
                            />
                          </View>
                        </View>
                        
                        <View style={styles.formGroup}>
                          <View style={styles.switchRow}>
                            <Text style={styles.label}>Recurring Task</Text>
                            <Switch
                              value={isRecurring}
                              onValueChange={setIsRecurring}
                              trackColor={{ false: colors.border, true: colors.primary + '80' }}
                              thumbColor={isRecurring ? colors.primary : colors.textTertiary}
                            />
                          </View>
                        </View>
                        
                        {isRecurring && (
                          <>
                            <View style={styles.formGroup}>
                              <Text style={styles.label}>Repeat Every</Text>
                              <View style={styles.recurrenceContainer}>
                                <TextInput
                                  style={styles.recurrenceIntervalInput}
                                  value={recurrenceInterval}
                                  onChangeText={setRecurrenceInterval}
                                  keyboardType="number-pad"
                                  placeholder="1"
                                  placeholderTextColor={colors.textTertiary}
                                />
                                
                                <View style={styles.recurrenceButtons}>
                                  <RecurrenceButton value="daily" label="Day" />
                                  <RecurrenceButton value="weekly" label="Week" />
                                  <RecurrenceButton value="monthly" label="Month" />
                                  <RecurrenceButton value="yearly" label="Year" />
                                </View>
                              </View>
                            </View>
                            
                            <View style={styles.formGroup}>
                              <Text style={styles.label}>End Date (optional)</Text>
                              <View style={styles.inputContainer}>
                                <Calendar size={16} color={colors.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                  style={styles.input}
                                  value={recurrenceEndDate}
                                  onChangeText={setRecurrenceEndDate}
                                  placeholder="YYYY-MM-DD"
                                  placeholderTextColor={colors.textTertiary}
                                />
                              </View>
                            </View>
                            
                            <View style={styles.formGroup}>
                              <Text style={styles.label}>Number of Occurrences</Text>
                              <View style={styles.inputContainer}>
                                <Repeat size={16} color={colors.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                  style={styles.input}
                                  value={recurrenceOccurrences}
                                  onChangeText={setRecurrenceOccurrences}
                                  placeholder="e.g. 10"
                                  placeholderTextColor={colors.textTertiary}
                                  keyboardType="number-pad"
                                />
                              </View>
                            </View>
                          </>
                        )}
                      </>
                    )}
                    
                    <TouchableOpacity 
                      style={[styles.addButton, !title.trim() && styles.addButtonDisabled]}
                      onPress={handleAddTask}
                      disabled={!title.trim()}
                    >
                      <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '90%',
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: '85%',
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
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    color: colors.text,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  priorityButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priorityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityButtonSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: colors.border,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityButtonTextSelected: {
    color: colors.primary,
  },
  categoriesContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  advancedOptionsToggle: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedOptionsToggleText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
  },
  recurrenceIntervalInput: {
    width: 40,
    height: 44,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  recurrenceButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginLeft: 8,
  },
  recurrenceButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  recurrenceButtonSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderColor: colors.border,
  },
  recurrenceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recurrenceButtonTextSelected: {
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});