import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatDateForDisplay, isToday, isSameDay } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';

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
    backgroundColor: colors.surface,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentDate: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  dateItem: {
    width: 48,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: colors.surfaceSecondary,
  },
  selectedDateItem: {
    backgroundColor: colors.primary,
  },
  todayDateItem: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  selectedText: {
    color: colors.text,
  },
  todayText: {
    color: colors.primary,
  },
});