import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { formatDateForDisplay, isToday, isSameDay } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

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
              style={styles.dateItemContainer}
              onPress={() => onSelectDate(date)}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={styles.dateItem}
                >
                  <Text style={styles.selectedDayName}>{dayName}</Text>
                  <Text style={styles.selectedDayNumber}>{day}</Text>
                </LinearGradient>
              ) : (
                <View style={[
                  styles.dateItem,
                  styles.unselectedDateItem,
                  today && styles.todayDateItem,
                ]}>
                  <Text style={[
                    styles.dayName,
                    today && styles.todayText,
                  ]}>
                    {dayName}
                  </Text>
                  <Text style={[
                    styles.dayNumber,
                    today && styles.todayText,
                  ]}>
                    {day}
                  </Text>
                </View>
              )}
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
    paddingVertical: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  currentDate: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    paddingHorizontal: 24,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  dateItemContainer: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dateItem: {
    width: 68,
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  unselectedDateItem: {
    backgroundColor: colors.surfaceSecondary,
  },
  todayDateItem: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  selectedDayName: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  selectedDayNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  todayText: {
    color: colors.primary,
  },
});