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
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { WorkoutSet } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, deleteWorkout } = useData();

  const workout = useMemo(() => {
    return workouts.find((w) => w.id === id);
  }, [workouts, id]);

  if (!workout) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>Workout not found</Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={CommonStyles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(workout.id);
            router.back();
          },
        },
      ]
    );
  };

  const duration = workout.endTime
    ? differenceInMinutes(parseISO(workout.endTime), parseISO(workout.startTime))
    : 0;

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const completedSets = workout.sets.filter((s) => s.isCompleted);
  const totalVolume = completedSets.reduce((total, set) => {
    return total + set.weight * set.reps;
  }, 0);

  // Group sets by exercise
  const exerciseGroups = workout.sets.reduce((groups, set) => {
    if (!groups[set.exerciseId]) {
      groups[set.exerciseId] = {
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        sets: [],
      };
    }
    groups[set.exerciseId].sets.push(set);
    return groups;
  }, {} as Record<string, { exerciseId: string; exerciseName: string; sets: WorkoutSet[] }>);

  return (
    <>
      <Stack.Screen
        options={{
          title: format(parseISO(workout.startTime), 'MMM d, yyyy'),
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={StrongColors.strongRed} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Header Info */}
        <View style={styles.headerCard}>
          <Text style={styles.dateText}>
            {format(parseISO(workout.startTime), 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={styles.timeText}>
            {format(parseISO(workout.startTime), 'h:mm a')}
            {workout.endTime && ` - ${format(parseISO(workout.endTime), 'h:mm a')}`}
          </Text>

          {workout.note && (
            <Text style={styles.note}>{workout.note}</Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{durationString}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{completedSets.length}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalVolume.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Volume (kg)</Text>
            </View>
          </View>
        </View>

        {/* Exercises */}
        <Text style={styles.sectionHeader}>Exercises</Text>

        {Object.values(exerciseGroups).map((group) => (
          <TouchableOpacity
            key={group.exerciseId}
            style={styles.exerciseCard}
            onPress={() => router.push(`/exercise/${group.exerciseId}`)}
          >
            <Text style={styles.exerciseName}>{group.exerciseName}</Text>

            {group.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <Text style={styles.setText}>
                  {set.weight} kg x {set.reps} reps
                </Text>
                {set.rpe && (
                  <Text style={styles.rpeText}>RPE {set.rpe}</Text>
                )}
                {set.isCompleted && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={StrongColors.strongGreen}
                  />
                )}
              </View>
            ))}

            <View style={styles.exerciseStats}>
              <Text style={styles.exerciseStatText}>
                {group.sets.filter((s) => s.isCompleted).length} sets completed
              </Text>
              <Text style={styles.exerciseStatText}>
                {group.sets
                  .filter((s) => s.isCompleted)
                  .reduce((sum, s) => sum + s.weight * s.reps, 0)
                  .toLocaleString()}{' '}
                kg volume
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  headerCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dateText: {
    ...Typography.title3,
    marginBottom: Spacing.xs,
  },
  timeText: {
    ...Typography.subheadline,
    marginBottom: Spacing.md,
  },
  note: {
    ...Typography.body,
    color: StrongColors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: StrongColors.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: StrongColors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
  },
  statLabel: {
    ...Typography.caption1,
    marginTop: Spacing.xs,
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
  exerciseName: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
    marginBottom: Spacing.md,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: StrongColors.border,
  },
  setNumber: {
    ...Typography.callout,
    fontWeight: '600',
    width: 30,
  },
  setText: {
    ...Typography.body,
    flex: 1,
  },
  rpeText: {
    ...Typography.caption1,
    marginRight: Spacing.sm,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  exerciseStatText: {
    ...Typography.caption1,
  },
});
