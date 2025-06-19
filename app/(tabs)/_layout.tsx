import React from "react";
import { Tabs } from "expo-router";
import { MessageSquare, CalendarDays, User, Brain } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Platform, TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 34 : 18,
          height: Platform.OS === 'ios' ? 96 : 76,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 16,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0,
          shadowOpacity: 0.15,
          height: 100,
        },
        headerShadowVisible: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 8,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: colors.text,
        },
        tabBarItemStyle: {
          paddingTop: 10,
          paddingBottom: 8,
        },
        tabBarIconStyle: {
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <MessageSquare size={28} color={color} strokeWidth={2} />,
          headerTitle: "Jarva AI",
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarLabel: "Agenda",
          tabBarIcon: ({ color, size }) => <CalendarDays size={28} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <User size={28} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarLabel: "Insights",
          tabBarIcon: ({ color, size }) => <Brain size={28} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 100,
    right: '50%',
    transform: [{ translateX: 28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});