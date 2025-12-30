import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, differenceInMinutes } from 'date-fns';

import { useData } from '@/contexts/DataContext';
import { WorkoutSession } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, deleteWorkout, isLoading } = useData();

  const handleDeleteWorkout = (workout: WorkoutSession) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(workout.id),
        },
      ]
    );
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return '--';
    const minutes = differenceInMinutes(parseISO(end), parseISO(start));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateVolume = (workout: WorkoutSession) => {
    return workout.sets.reduce((total, set) => {
      if (set.isCompleted) {
        return total + set.weight * set.reps;
      }
      return total;
    }, 0);
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSession }) => {
    const completedSets = item.sets.filter((s) => s.isCompleted).length;
    const uniqueExercises = new Set(item.sets.map((s) => s.exerciseId)).size;
    const volume = calculateVolume(item);

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => router.push(`/workout/${item.id}`)}
        onLongPress={() => handleDeleteWorkout(item)}
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutDate}>
            {format(parseISO(item.startTime), 'EEEE, MMM d')}
          </Text>
          <Text style={styles.workoutTime}>
            {format(parseISO(item.startTime), 'h:mm a')}
          </Text>
        </View>

        {item.note && <Text style={styles.workoutNote}>{item.note}</Text>}

        <View style={styles.workoutStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {formatDuration(item.startTime, item.endTime)}
            </Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{uniqueExercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{completedSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{volume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Volume (kg)</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={StrongColors.strongBlue} />
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="barbell-outline" size={64} color={StrongColors.textTertiary} />
        <Text style={styles.emptyTitle}>No Workouts Yet</Text>
        <Text style={styles.emptyText}>
          Complete your first workout to see it here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={workouts}
      keyExtractor={(item) => item.id}
      renderItem={renderWorkoutItem}
      showsVerticalScrollIndicator={false}
    />
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
  workoutCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  workoutDate: {
    ...Typography.headline,
  },
  workoutTime: {
    ...Typography.subheadline,
  },
  workoutNote: {
    ...Typography.body,
    color: StrongColors.textSecondary,
    marginBottom: Spacing.md,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
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
  emptyTitle: {
    ...Typography.title2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.subheadline,
    textAlign: 'center',
  },
});
