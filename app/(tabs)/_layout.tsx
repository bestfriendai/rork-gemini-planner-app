import React from "react";
import { Tabs } from "expo-router";
import { MessageCircle, Calendar, CheckSquare, Settings } from "lucide-react-native";
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
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 80 : 60,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          marginBottom: 2,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
          color: colors.text,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Assistant",
          tabBarLabel: "Assistant",
          tabBarIcon: ({ color, size }) => <MessageCircle size={22} color={color} strokeWidth={1.5} />,
          headerTitle: "Jarva",
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarLabel: "Planner",
          tabBarIcon: ({ color, size }) => <Calendar size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size }) => <CheckSquare size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={22} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}