import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useData } from '@/contexts/DataContext';
import { ExerciseMetric, calculateEstimated1RM } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface ExerciseWidgetProps {
  exerciseId: string;
  metric: ExerciseMetric;
}

export const ExerciseWidget: React.FC<ExerciseWidgetProps> = ({
  exerciseId,
  metric,
}) => {
  const router = useRouter();
  const { getExerciseById, getExerciseRecords, getWorkoutHistory } = useData();

  const exercise = getExerciseById(exerciseId);
  const records = getExerciseRecords(exerciseId);
  const history = getWorkoutHistory(exerciseId);

  const displayValue = useMemo(() => {
    switch (metric) {
      case 'Est. 1RM':
        return records.max1RM > 0 ? `${records.max1RM} kg` : '--';
      case 'Max Weight':
        return records.maxWeight > 0 ? `${records.maxWeight} kg` : '--';
      case 'Volume':
        return records.maxVolume > 0 ? `${records.maxVolume} kg` : '--';
      case 'Max Reps':
        return records.maxReps > 0 ? `${records.maxReps}` : '--';
      case 'Best Set':
        if (history.length === 0) return '--';
        const bestSet = history.reduce((best, set) => {
          const volume = set.weight * set.reps;
          const bestVolume = best.weight * best.reps;
          return volume > bestVolume ? set : best;
        });
        return `${bestSet.weight}kg x ${bestSet.reps}`;
      default:
        return '--';
    }
  }, [metric, records, history]);

  if (!exercise) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/exercise/${exerciseId}`)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="barbell" size={24} color={StrongColors.strongBlue} />
      </View>

      <View style={styles.content}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.metricLabel}>{metric}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{displayValue}</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={StrongColors.textTertiary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: StrongColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  exerciseName: {
    ...Typography.headline,
    marginBottom: 2,
  },
  metricLabel: {
    ...Typography.caption1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  value: {
    ...Typography.title3,
    color: StrongColors.strongBlue,
  },
});
