import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors } from '@/constants/colors';

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
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
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
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
    fontWeight: '400',
  },
  chevron: {
    fontSize: 16,
    color: colors.textTertiary,
    fontWeight: '300',
  },
});