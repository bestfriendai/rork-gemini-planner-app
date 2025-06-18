import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Tag, Briefcase, ChevronRight } from 'lucide-react-native';
import { useTaskStore } from '@/store/taskStore';
import { ManageCategories } from '@/components/ManageCategories';
import { ManageProjects } from '@/components/ManageProjects';
import { colors } from '@/constants/colors';
import { getShadow } from '@/utils/shadowUtils';

export default function OrganizeScreen() {
  const [activeScreen, setActiveScreen] = useState<'none' | 'categories' | 'projects'>('none');
  const { categories, projects } = useTaskStore();
  
  return (
    <View style={styles.container}>
      {activeScreen === 'none' && (
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Organize</Text>
          <Text style={styles.subtitle}>Manage your projects and categories to keep your tasks organized</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => setActiveScreen('categories')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Tag size={20} color={colors.text} strokeWidth={1.5} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Categories</Text>
                <Text style={styles.cardSubtitle}>
                  {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.cardDescription}>
              Categories help you group similar tasks together. Use them to organize tasks by type, context, or priority.
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => setActiveScreen('projects')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Briefcase size={20} color={colors.text} strokeWidth={1.5} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Projects</Text>
                <Text style={styles.cardSubtitle}>
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'} available
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.cardDescription}>
              Projects help you organize related tasks that contribute to a common goal. Use them for larger initiatives or ongoing work.
            </Text>
          </TouchableOpacity>
          
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Organization Tips</Text>
            <View style={styles.tipCard}>
              <Text style={styles.tipNumber}>1</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Use Categories for Context</Text>
                <Text style={styles.tipDescription}>
                  Categories are great for grouping tasks by context (Work, Personal, Health) or by energy level (High Focus, Quick Tasks).
                </Text>
              </View>
            </View>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipNumber}>2</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Projects for Related Tasks</Text>
                <Text style={styles.tipDescription}>
                  Group related tasks under projects to track progress toward specific goals or deliverables.
                </Text>
              </View>
            </View>
            
            <View style={styles.tipCard}>
              <Text style={styles.tipNumber}>3</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Combine Both for Clarity</Text>
                <Text style={styles.tipDescription}>
                  A task can belong to both a category and a project. For example, a "Design Logo" task could be in the "Design" category and the "Website Redesign" project.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      
      {activeScreen === 'categories' && (
        <ManageCategories 
          visible={true} 
          onClose={() => setActiveScreen('none')} 
        />
      )}
      
      {activeScreen === 'projects' && (
        <ManageProjects 
          visible={true} 
          onClose={() => setActiveScreen('none')} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...getShadow(2),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tipsContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...getShadow(1),
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});