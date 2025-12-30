import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

export default function RoutineDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, startWorkout, deleteRoutine } = useData();

  const routine = useMemo(() => {
    return routines.find((r) => r.id === id);
  }, [routines, id]);

  if (!routine) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>Routine not found</Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={CommonStyles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStartWorkout = () => {
    startWorkout(routine);
    router.push('/workout/active');
  };

  const handleEdit = () => {
    router.push(`/routine/create?id=${routine.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRoutine(routine.id);
            router.back();
          },
        },
      ]
    );
  };

  const totalSets = routine.exercises.reduce((sum, e) => sum + e.sets.length, 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: routine.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Ionicons name="pencil" size={20} color={StrongColors.strongBlue} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={20} color={StrongColors.strongRed} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{routine.exercises.length}</Text>
              <Text style={styles.summaryLabel}>Exercises</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalSets}</Text>
              <Text style={styles.summaryLabel}>Total Sets</Text>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <Text style={styles.sectionHeader}>Exercises</Text>

        {routine.exercises.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => router.push(`/exercise/${exercise.exerciseId}`)}
          >
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseNumber}>{index + 1}</Text>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
            </View>

            <View style={styles.setsPreview}>
              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setPreview}>
                  <Text style={styles.setPreviewText}>
                    Set {setIndex + 1}: {set.weight > 0 ? `${set.weight} kg` : '--'} x{' '}
                    {set.reps > 0 ? set.reps : '--'}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Start Workout Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity style={CommonStyles.primaryButton} onPress={handleStartWorkout}>
          <Ionicons name="play" size={20} color={StrongColors.textPrimary} />
          <Text style={[CommonStyles.primaryButtonText, { marginLeft: Spacing.sm }]}>
            Start Workout
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StrongColors.background,
    padding: Spacing.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.headline,
    marginBottom: Spacing.lg,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  summaryCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...Typography.title1,
    color: StrongColors.strongBlue,
  },
  summaryLabel: {
    ...Typography.caption1,
    marginTop: Spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: StrongColors.border,
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
    marginTop: 0,
  },
  exerciseCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseNumber: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
    backgroundColor: StrongColors.inputBackground,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    marginRight: Spacing.md,
  },
  exerciseName: {
    ...Typography.headline,
    flex: 1,
  },
  setsPreview: {
    marginLeft: 40,
  },
  setPreview: {
    paddingVertical: Spacing.xs,
  },
  setPreviewText: {
    ...Typography.subheadline,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: StrongColors.background,
    borderTopWidth: 1,
    borderTopColor: StrongColors.border,
  },
});
