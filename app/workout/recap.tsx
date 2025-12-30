import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { differenceInMinutes, parseISO } from 'date-fns';

import { useData } from '@/contexts/DataContext';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

export default function WorkoutRecapScreen() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { workouts } = useData();

  const workout = useMemo(() => {
    return workouts.find((w) => w.id === sessionId);
  }, [workouts, sessionId]);

  if (!workout) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>Workout not found</Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.replace('/(tabs)/workout')}
        >
          <Text style={CommonStyles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

  const uniqueExercises = new Set(workout.sets.map((s) => s.exerciseId)).size;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={StrongColors.strongGreen} />
        </View>

        <Text style={styles.title}>Workout Complete!</Text>
        <Text style={styles.subtitle}>Great work on your session</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{durationString}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalVolume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Volume (kg)</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedSets.length}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
        </View>

        <View style={styles.secondaryStats}>
          <View style={styles.secondaryStat}>
            <Ionicons name="barbell" size={20} color={StrongColors.strongBlue} />
            <Text style={styles.secondaryStatText}>
              {uniqueExercises} exercises performed
            </Text>
          </View>
        </View>
      </View>

      {/* Done Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.replace('/(tabs)/workout')}
        >
          <Text style={CommonStyles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  emptyText: {
    ...Typography.headline,
    marginBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.largeTitle,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.subheadline,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.title1,
    color: StrongColors.strongBlue,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption1,
  },
  statDivider: {
    width: 1,
    backgroundColor: StrongColors.border,
    marginHorizontal: Spacing.md,
  },
  secondaryStats: {
    marginTop: Spacing.xl,
    width: '100%',
  },
  secondaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
  },
  secondaryStatText: {
    ...Typography.callout,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
});
