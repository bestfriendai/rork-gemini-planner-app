import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Plus, Edit2, Trash2, X, Check, Tag } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { Category } from '@/types';
import { colors } from '@/constants/colors';
import { getShadow } from '@/utils/shadowUtils';

type ManageCategoriesProps = {
  visible: boolean;
  onClose: () => void;
};

export const ManageCategories: React.FC<ManageCategoriesProps> = ({ visible, onClose }) => {
  const { categories, addCategory, updateCategory, deleteCategory } = useTaskStore();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4F46E5'); // Default color
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
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
    setNewCategoryName('');
    setNewCategoryColor('#4F46E5');
    setEditingCategory(null);
  };
  
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      if (editingCategory) {
        // Update existing category
        updateCategory(editingCategory.id, {
          name: newCategoryName.trim(),
          color: newCategoryColor,
        });
      } else {
        // Add new category
        addCategory({
          name: newCategoryName.trim(),
          color: newCategoryColor,
        });
      }
      resetForm();
    }
  };
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? Tasks with this category will be updated.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteCategory(categoryId);
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
        <Text style={styles.title}>Manage Categories</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          style={styles.input}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="Enter category name"
          placeholderTextColor={colors.textTertiary}
        />
        
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorOptions}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                newCategoryColor === color && styles.colorOptionSelected,
              ]}
              onPress={() => setNewCategoryColor(color)}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, !newCategoryName.trim() && styles.addButtonDisabled]}
          onPress={handleAddCategory}
          disabled={!newCategoryName.trim()}
        >
          {editingCategory ? (
            <>
              <Check size={16} color={colors.text} />
              <Text style={styles.addButtonText}>Update Category</Text>
            </>
          ) : (
            <>
              <Plus size={16} color={colors.text} />
              <Text style={styles.addButtonText}>Add Category</Text>
            </>
          )}
        </TouchableOpacity>
        
        {editingCategory && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={resetForm}
          >
            <X size={16} color={colors.textSecondary} />
            <Text style={styles.cancelButtonText}>Cancel Editing</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.sectionTitle}>Your Categories</Text>
      
      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Tag size={40} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={styles.emptyStateText}>No categories yet</Text>
          <Text style={styles.emptyStateSubtext}>Add categories to organize your tasks</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                <Text style={styles.categoryName}>{item.name}</Text>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEditCategory(item)}
                >
                  <Edit2 size={16} color={colors.textSecondary} strokeWidth={1.5} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteCategory(item.id)}
                >
                  <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.categoryList}
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
  categoryList: {
    paddingBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    ...getShadow(1),
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: colors.text,
  },
  categoryActions: {
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