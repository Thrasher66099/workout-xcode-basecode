import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { Routine } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

export default function WorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    routines,
    startWorkout,
    deleteRoutine,
    duplicateRoutine,
    activeWorkout,
    isLoading,
  } = useData();

  const handleStartEmptyWorkout = () => {
    startWorkout();
    router.push('/workout/active');
  };

  const handleStartFromRoutine = (routine: Routine) => {
    startWorkout(routine);
    router.push('/workout/active');
  };

  const handleRoutineOptions = (routine: Routine) => {
    Alert.alert(routine.name, 'Choose an action', [
      {
        text: 'Start Workout',
        onPress: () => handleStartFromRoutine(routine),
      },
      {
        text: 'View Details',
        onPress: () => router.push(`/routine/${routine.id}`),
      },
      {
        text: 'Edit',
        onPress: () => router.push(`/routine/create?id=${routine.id}`),
      },
      {
        text: 'Duplicate',
        onPress: async () => {
          await duplicateRoutine(routine.id);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Delete Routine',
            `Are you sure you want to delete "${routine.name}"?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteRoutine(routine.id),
              },
            ]
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Group routines by folder
  const groupedRoutines = routines.reduce((acc, routine) => {
    const folder = routine.folder || 'My Routines';
    if (!acc[folder]) {
      acc[folder] = [];
    }
    acc[folder].push(routine);
    return acc;
  }, {} as Record<string, Routine[]>);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={StrongColors.strongBlue} />
      </View>
    );
  }

  // If there's an active workout, show continue button
  if (activeWorkout) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="fitness" size={64} color={StrongColors.strongBlue} />
        <Text style={styles.activeTitle}>Workout In Progress</Text>
        <Text style={styles.activeSubtitle}>
          {activeWorkout.session.sets.length} sets logged
        </Text>
        <TouchableOpacity
          style={[CommonStyles.primaryButton, styles.continueButton]}
          onPress={() => router.push('/workout/active')}
        >
          <Text style={CommonStyles.primaryButtonText}>Continue Workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Quick Start Section */}
      <Text style={styles.sectionHeader}>Quick Start</Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartEmptyWorkout}
      >
        <View style={styles.startButtonIcon}>
          <Ionicons name="add" size={28} color={StrongColors.textPrimary} />
        </View>
        <View style={styles.startButtonContent}>
          <Text style={styles.startButtonTitle}>Start Empty Workout</Text>
          <Text style={styles.startButtonSubtitle}>
            Begin with a blank workout and add exercises as you go
          </Text>
        </View>
      </TouchableOpacity>

      {/* Routines Section */}
      <View style={styles.routinesHeader}>
        <Text style={styles.sectionHeader}>Routines</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/routine/create')}
        >
          <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
        </TouchableOpacity>
      </View>

      {Object.keys(groupedRoutines).length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="clipboard-outline" size={48} color={StrongColors.textTertiary} />
          <Text style={styles.emptyStateText}>No routines yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create a routine to quickly start workouts with pre-defined exercises
          </Text>
          <TouchableOpacity
            style={[CommonStyles.primaryButton, { marginTop: Spacing.md }]}
            onPress={() => router.push('/routine/create')}
          >
            <Text style={CommonStyles.primaryButtonText}>Create Routine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        Object.entries(groupedRoutines).map(([folder, folderRoutines]) => (
          <View key={folder} style={styles.folderSection}>
            <Text style={styles.folderName}>{folder}</Text>
            {folderRoutines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                style={styles.routineCard}
                onPress={() => handleStartFromRoutine(routine)}
                onLongPress={() => handleRoutineOptions(routine)}
              >
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{routine.name}</Text>
                  <Text style={styles.routineExercises}>
                    {routine.exercises.length} exercises
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.routineOptions}
                  onPress={() => handleRoutineOptions(routine)}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={StrongColors.textSecondary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StrongColors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  content: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
    marginTop: 0,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  startButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: StrongColors.strongBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  startButtonContent: {
    flex: 1,
  },
  startButtonTitle: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  startButtonSubtitle: {
    ...Typography.subheadline,
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  createButton: {
    padding: Spacing.xs,
  },
  folderSection: {
    marginBottom: Spacing.lg,
  },
  folderName: {
    ...Typography.footnote,
    color: StrongColors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    ...Typography.headline,
    marginBottom: Spacing.xs,
  },
  routineExercises: {
    ...Typography.subheadline,
  },
  routineOptions: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
  },
  emptyStateText: {
    ...Typography.headline,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.subheadline,
    textAlign: 'center',
  },
  activeTitle: {
    ...Typography.title2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  activeSubtitle: {
    ...Typography.subheadline,
    marginBottom: Spacing.xl,
  },
  continueButton: {
    paddingHorizontal: Spacing.xxxl,
  },
});
