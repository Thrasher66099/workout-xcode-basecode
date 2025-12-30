import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DataProvider } from '@/contexts/DataContext';
import { StrongColors } from '@/constants/theme';

// Custom dark theme matching StrongAI iOS app
const StrongAIDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: StrongColors.strongBlue,
    background: StrongColors.strongBlack,
    card: StrongColors.cardBackground,
    text: StrongColors.textPrimary,
    border: StrongColors.border,
    notification: StrongColors.strongBlue,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <DataProvider>
      <ThemeProvider value={StrongAIDarkTheme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: StrongColors.strongBlack,
            },
            headerTintColor: StrongColors.textPrimary,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: StrongColors.strongBlack,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="workout/active"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="workout/recap"
            options={{
              presentation: 'modal',
              title: 'Workout Complete',
            }}
          />
          <Stack.Screen
            name="routine/create"
            options={{
              presentation: 'modal',
              title: 'Create Routine',
            }}
          />
          <Stack.Screen
            name="routine/[id]"
            options={{
              title: 'Routine',
            }}
          />
          <Stack.Screen
            name="exercise/[id]"
            options={{
              title: 'Exercise',
            }}
          />
          <Stack.Screen
            name="exercise/create"
            options={{
              presentation: 'modal',
              title: 'Create Exercise',
            }}
          />
          <Stack.Screen
            name="exercise/select"
            options={{
              presentation: 'modal',
              title: 'Select Exercise',
            }}
          />
          <Stack.Screen
            name="settings/goals"
            options={{
              title: 'Set Goals',
            }}
          />
          <Stack.Screen
            name="settings/add-widget"
            options={{
              presentation: 'modal',
              title: 'Add Widget',
            }}
          />
          <Stack.Screen
            name="measure/log"
            options={{
              presentation: 'modal',
              title: 'Log Measurement',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </DataProvider>
  );
}
