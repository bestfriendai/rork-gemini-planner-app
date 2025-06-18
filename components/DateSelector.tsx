import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatDateForDisplay, isToday, isSameDay } from '@/utils/dateUtils';

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
              <Text 
                style={[
                  styles.dayName,
                  isSelected && styles.selectedText,
                  today && !isSelected && styles.todayText,
                ]}
              >
                {dayName}
              </Text>
              <Text 
                style={[
                  styles.dayNumber,
                  isSelected && styles.selectedText,
                  today && !isSelected && styles.todayText,
                ]}
              >
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
  },
  currentDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 15,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  dateItem: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F9FAFC',
  },
  selectedDateItem: {
    backgroundColor: '#4A86E8',
  },
  todayDateItem: {
    borderWidth: 2,
    borderColor: '#4A86E8',
  },
  dayName: {
    fontSize: 13,
    color: '#6E7A8A',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  selectedText: {
    color: 'white',
  },
  todayText: {
    color: '#4A86E8',
  },
});