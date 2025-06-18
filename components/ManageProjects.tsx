import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Plus, Edit2, Trash2, X, Check, Briefcase } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { Project } from '@/types';
import { colors } from '@/constants/colors';
import { getShadow } from '@/utils/shadowUtils';

type ManageProjectsProps = {
  visible: boolean;
  onClose: () => void;
};

export const ManageProjects: React.FC<ManageProjectsProps> = ({ visible, onClose }) => {
  const { projects, addProject, updateProject, deleteProject } = useTaskStore();
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#4F46E5'); // Default color
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const colorOptions = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];
  
  const resetForm = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectColor('#4F46E5');
    setEditingProject(null);
  };
  
  const handleAddProject = () => {
    if (newProjectName.trim()) {
      if (editingProject) {
        // Update existing project
        updateProject(editingProject.id, {
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
          color: newProjectColor,
        });
      } else {
        // Add new project
        addProject({
          name: newProjectName.trim(),
          description: newProjectDescription.trim() || undefined,
          color: newProjectColor,
        });
      }
      resetForm();
    }
  };
  
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || '');
    setNewProjectColor(project.color || '#4F46E5');
  };
  
  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? Tasks associated with this project will be updated.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteProject(projectId);
            resetForm();
          }
        },
      ]
    );
  };
  
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Projects</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Project Name</Text>
        <TextInput
          style={styles.input}
          value={newProjectName}
          onChangeText={setNewProjectName}
          placeholder="Enter project name"
          placeholderTextColor={colors.textTertiary}
        />
        
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={newProjectDescription}
          onChangeText={setNewProjectDescription}
          placeholder="Enter project description"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorOptions}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                newProjectColor === color && styles.colorOptionSelected,
              ]}
              onPress={() => setNewProjectColor(color)}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, !newProjectName.trim() && styles.addButtonDisabled]}
          onPress={handleAddProject}
          disabled={!newProjectName.trim()}
        >
          {editingProject ? (
            <>
              <Check size={16} color={colors.text} />
              <Text style={styles.addButtonText}>Update Project</Text>
            </>
          ) : (
            <>
              <Plus size={16} color={colors.text} />
              <Text style={styles.addButtonText}>Add Project</Text>
            </>
          )}
        </TouchableOpacity>
        
        {editingProject && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={resetForm}
          >
            <X size={16} color={colors.textSecondary} />
            <Text style={styles.cancelButtonText}>Cancel Editing</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.sectionTitle}>Your Projects</Text>
      
      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <Briefcase size={40} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.emptyStateText}>No projects yet</Text>
          <Text style={styles.emptyStateSubtext}>Add projects to organize your tasks</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.projectItem}>
              <View style={styles.projectInfo}>
                <View 
                  style={[
                    styles.projectColor, 
                    { backgroundColor: item.color || '#4F46E5' }
                  ]} 
                />
                <View>
                  <Text style={styles.projectName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.projectDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.projectActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditProject(item)}
                >
                  <Edit2 size={16} color={colors.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteProject(item.id)}
                >
                  <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.projectList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...getShadow(1),
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 8,
    ...getShadow(1),
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.text,
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  projectList: {
    paddingBottom: 16,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    ...getShadow(1),
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  projectName: {
    fontSize: 16,
    color: colors.text,
  },
  projectDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});