import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { shadows } from '@/utils/shadowUtils';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={isSwitch || !onPress}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
          thumbColor={colors.text}
        />
      ) : onPress ? (
        <ChevronRight size={16} color={colors.textTertiary} strokeWidth={1.5} />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14, // Apple uses consistent corner radii
    marginBottom: 10, // Slightly more spacing between items
    marginHorizontal: 16,
    borderWidth: 0, // Apple typically doesn't use borders on list items
    ...shadows.small, // Subtle shadow
  },
  iconContainer: {
    width: 32, // Slightly smaller for Apple style
    height: 32, // Slightly smaller for Apple style
    borderRadius: 8, // Apple uses consistent corner radii
    backgroundColor: colors.surfaceTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // Slightly more spacing for better readability
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Better vertical alignment
  },
  title: {
    fontSize: 17, // SF Pro Text standard size
    fontWeight: '500', // SF Pro Text Medium
    color: colors.text,
    marginBottom: 4, // Slightly more spacing between title and subtitle
    letterSpacing: -0.41, // Apple's SF Pro has tighter letter spacing
  },
  subtitle: {
    fontSize: 14, // SF Pro Text caption size
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '400', // SF Pro Text Regular
    letterSpacing: -0.24, // Apple's SF Pro has tighter letter spacing
  },
});