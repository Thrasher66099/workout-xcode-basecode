import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StrongColors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="workout"
      screenOptions={{
        tabBarActiveTintColor: StrongColors.strongBlue,
        tabBarInactiveTintColor: StrongColors.textSecondary,
        tabBarStyle: {
          backgroundColor: StrongColors.cardBackground,
          borderTopColor: StrongColors.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: StrongColors.strongBlack,
        },
        headerTintColor: StrongColors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="plus.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercises',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="dumbbell.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="measure"
        options={{
          title: 'Measure',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="ruler.fill" color={color} />
          ),
        }}
      />
      {/* Hide the old tabs */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
