import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Check, X, Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';
import { Task } from '@/types';

interface InteractiveTaskPromptProps {
  tasks: Task[];
  onConfirm: (tasks: Task[]) => void;
  onDismiss: () => void;
}

export const InteractiveTaskPrompt: React.FC<InteractiveTaskPromptProps> = ({ tasks, onConfirm, onDismiss }) => {
  const [editableTasks, setEditableTasks] = useState(tasks);

  const handleTitleChange = (text: string, index: number) => {
    const newTasks = [...editableTasks];
    newTasks[index].title = text;
    setEditableTasks(newTasks);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = editableTasks.filter((_, i) => i !== index);
    if (newTasks.length === 0) {
        onDismiss();
    } else {
        setEditableTasks(newTasks);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>AI detected these tasks. Add to planner?</Text>
        {editableTasks.map((task, index) => (
          <View key={task.id} style={styles.taskItem}>
            <TextInput 
              style={styles.taskInput}
              value={task.title}
              onChangeText={(text) => handleTitleChange(text, index)}
            />
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveTask(index)}>
                <Trash2 size={18} color={colors.textSecondary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.dismissButton]} onPress={onDismiss}>
          <X size={18} color={colors.text} strokeWidth={1.5} />
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={() => onConfirm(editableTasks)}>
          <Check size={18} color={colors.text} strokeWidth={1.5} />
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        maxHeight: 280,
        ...shadows.medium,
        overflow: 'hidden',
    },
    scrollView: {
        padding: 16,
    },
    header: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 14,
        textAlign: 'center',
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceTertiary,
        borderRadius: 12,
        marginBottom: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.borderLight,
        ...shadows.small,
    },
    taskInput: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
        paddingVertical: 12,
        fontWeight: '500',
    },
    removeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.surfaceElevated,
        ...shadows.small,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
    },
    dismissButton: {
        borderRightWidth: 1,
        borderRightColor: colors.borderLight,
    },
    confirmButton: {
        backgroundColor: colors.primaryMuted,
    },
    buttonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 15,
        marginLeft: 8,
    },
});
