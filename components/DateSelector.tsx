import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatDateForDisplay, isToday, isSameDay } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ 
  dates, 
  selectedDate, 
  onSelectDate 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.currentDate}>
        {formatDateForDisplay(selectedDate)}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((date) => {
          const day = new Date(date).getDate();
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          const isSelected = isSameDay(date, selectedDate);
          const today = isToday(date);
          
          return (
            <TouchableOpacity
              key={date}
              style={[
                styles.dateItem,
                isSelected && styles.selectedDateItem,
                today && !isSelected && styles.todayDateItem,
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedText,
                today && !isSelected && styles.todayText,
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedText,
                today && !isSelected && styles.todayText,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 16,
    borderBottomWidth: 0.5, // Apple uses thin dividers
    borderBottomColor: colors.border,
    ...shadows.small,
  },
  currentDate: {
    fontSize: 20, // Apple uses larger headers
    fontWeight: '600', // SF Pro Display Semibold
    color: colors.text,
    marginBottom: 16, // Slightly more spacing
    paddingHorizontal: 16,
    letterSpacing: -0.5, // Apple's SF Pro Display has tighter letter spacing
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 6, // Slightly more padding
  },
  dateItem: {
    width: 44, // Apple calendar size
    height: 70, // Taller for better touch targets
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10, // Apple calendar style
    marginHorizontal: 6,
    backgroundColor: colors.surface,
    ...shadows.small,
    borderWidth: 0, // Apple typically doesn't use borders
  },
  selectedDateItem: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.05 }], // Apple uses subtle scale effects for selection
  },
  todayDateItem: {
    backgroundColor: colors.primaryMuted, // Apple uses background tint instead of borders
  },
  dayName: {
    fontSize: 12, // SF Pro Text caption size
    color: colors.textSecondary,
    marginBottom: 4, // Slightly more spacing
    fontWeight: '500', // SF Pro Text Medium
    letterSpacing: -0.24, // Apple's SF Pro has tighter letter spacing
    textTransform: 'uppercase', // Apple often uses uppercase for day abbreviations
  },
  dayNumber: {
    fontSize: 20, // Apple uses larger numbers for better readability
    fontWeight: '600', // SF Pro Display Semibold
    color: colors.text,
    marginTop: 2,
    letterSpacing: -0.5, // Apple's SF Pro Display has tighter letter spacing
  },
  selectedText: {
    color: colors.white,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700', // SF Pro Text Bold for today's date
  },
});