import React from "react";
import { Tabs } from "expo-router";
import { MessageSquare, Calendar, CheckSquare, Settings } from "lucide-react-native";
import { colors } from "@/constants/colors";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingTop: 16,
          paddingBottom: 16,
          height: 92,
          position: 'absolute',
        },
        tabBarBackground: Platform.OS === 'ios' ? () => (
          <BlurView
            intensity={100}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: colors.glass,
            }}
          />
        ) : undefined,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
        },
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 8,
          letterSpacing: 0.5,
        },
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 24,
          color: colors.text,
          letterSpacing: -0.8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Assistant",
          tabBarLabel: "Assistant",
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          headerTitle: "Jarva",
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarLabel: "Planner",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}