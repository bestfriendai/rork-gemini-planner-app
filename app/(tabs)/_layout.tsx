import React from "react";
import { Tabs } from "expo-router";
import { MessageSquare, Calendar, CheckSquare, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4A86E8',
        tabBarInactiveTintColor: '#6E7A8A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E9F0',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E9F0',
        },
        headerShadowVisible: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Assistant",
          tabBarLabel: "Assistant",
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
          headerTitle: "Gemini Assistant",
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarLabel: "Planner",
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarLabel: "Tasks",
          tabBarIcon: ({ color }) => <CheckSquare size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}