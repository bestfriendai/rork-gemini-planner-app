import React from "react";
import { Tabs } from "expo-router";
import { MessageSquare, Calendar, CheckSquare2, Settings } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textQuaternary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 32 : 16,
          height: Platform.OS === 'ios' ? 88 : 72,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: colors.text,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Assistant",
          tabBarLabel: "Assistant",
          tabBarIcon: ({ color, size }) => <MessageSquare size={20} color={color} strokeWidth={1.5} />,
          headerTitle: "Jarva",
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarLabel: "Planner",
          tabBarIcon: ({ color, size }) => <Calendar size={20} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size }) => <CheckSquare2 size={20} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={20} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}