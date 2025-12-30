import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { differenceInSeconds, formatDuration, intervalToDuration } from 'date-fns';

import { useData } from '@/contexts/DataContext';
import { useRestTimer, REST_DURATIONS } from '@/hooks/useRestTimer';
import { WorkoutSet, SetType } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

const SET_TYPES: SetType[] = ['Normal', 'Warmup', 'Drop', 'Failure'];

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    activeWorkout,
    endWorkout,
    cancelWorkout,
    addSetToWorkout,
    updateSetInWorkout,
    deleteSetFromWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    getExerciseById,
  } = useData();

  const restTimer = useRestTimer();
  const [workoutDuration, setWorkoutDuration] = useState('0:00');
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [editingSet, setEditingSet] = useState<string | null>(null);

  // Update workout duration every second
  useEffect(() => {
    if (!activeWorkout) return;

    const updateDuration = () => {
      const seconds = differenceInSeconds(
        new Date(),
        new Date(activeWorkout.session.startTime)
      );
      const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
      const hours = duration.hours || 0;
      const minutes = duration.minutes || 0;
      const secs = duration.seconds || 0;

      if (hours > 0) {
        setWorkoutDuration(`${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } else {
        setWorkoutDuration(`${minutes}:${secs.toString().padStart(2, '0')}`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Group sets by exercise
  const exerciseGroups = activeWorkout
    ? activeWorkout.session.sets.reduce((groups, set) => {
        if (!groups[set.exerciseId]) {
          groups[set.exerciseId] = {
            exerciseId: set.exerciseId,
            exerciseName: set.exerciseName,
            sets: [],
          };
        }
        groups[set.exerciseId].sets.push(set);
        return groups;
      }, {} as Record<string, { exerciseId: string; exerciseName: string; sets: WorkoutSet[] }>)
    : {};

  const handleFinishWorkout = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            const session = await endWorkout();
            if (session) {
              router.replace({
                pathname: '/workout/recap',
                params: { sessionId: session.id },
              });
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel? All progress will be lost.',
      [
        { text: 'Keep Working Out', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            cancelWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const handleAddExercise = () => {
    router.push('/exercise/select?mode=workout');
  };

  const handleCompleteSet = (set: WorkoutSet) => {
    updateSetInWorkout(set.id, { isCompleted: !set.isCompleted });
    if (!set.isCompleted) {
      // Show rest timer when completing a set
      setShowRestTimer(true);
    }
  };

  const handleAddSet = (exerciseId: string, exerciseName: string) => {
    const existingSets = activeWorkout?.session.sets.filter(
      (s) => s.exerciseId === exerciseId
    );
    const lastSet = existingSets?.[existingSets.length - 1];

    addSetToWorkout(exerciseId, {
      index: (existingSets?.length || 0),
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
      isCompleted: false,
      type: 'Normal',
    });
  };

  const handleStartRestTimer = (duration: number) => {
    restTimer.start(duration);
    setShowRestTimer(false);
  };

  if (!activeWorkout) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>No active workout</Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={CommonStyles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleCancelWorkout}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={20} color={StrongColors.textPrimary} />
          <Text style={styles.timer}>{workoutDuration}</Text>
        </View>
        <TouchableOpacity onPress={handleFinishWorkout}>
          <Text style={styles.finishButton}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer Overlay */}
      {restTimer.isRunning && (
        <View style={styles.restTimerOverlay}>
          <Text style={styles.restTimerLabel}>Rest Timer</Text>
          <Text style={styles.restTimerTime}>{restTimer.timeString}</Text>
          <TouchableOpacity
            style={styles.addTimeButton}
            onPress={() => restTimer.addTime(30)}
          >
            <Ionicons name="add" size={20} color={StrongColors.textPrimary} />
            <Text style={styles.addTimeText}>30s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissTimerButton}
            onPress={restTimer.stop}
          >
            <Text style={styles.dismissTimerText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rest Timer Selection Modal */}
      {showRestTimer && !restTimer.isRunning && (
        <View style={styles.restTimerModal}>
          <Text style={styles.restTimerModalTitle}>Start Rest Timer</Text>
          <View style={styles.restTimerOptions}>
            {REST_DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration.value}
                style={styles.restTimerOption}
                onPress={() => handleStartRestTimer(duration.value)}
              >
                <Text style={styles.restTimerOptionText}>{duration.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.skipTimerButton}
            onPress={() => setShowRestTimer(false)}
          >
            <Text style={styles.skipTimerText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise Cards */}
        {Object.values(exerciseGroups).map((group) => (
          <View key={group.exerciseId} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{group.exerciseName}</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Remove Exercise',
                    `Remove ${group.exerciseName} from this workout?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeExerciseFromWorkout(group.exerciseId),
                      },
                    ]
                  );
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={StrongColors.strongRed}
                />
              </TouchableOpacity>
            </View>

            {/* Set Headers */}
            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { flex: 0.5 }]}>SET</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
              <Text style={[styles.setHeaderText, { flex: 0.5 }]}></Text>
            </View>

            {/* Sets */}
            {group.sets.map((set, index) => (
              <SetRow
                key={set.id}
                set={set}
                setNumber={index + 1}
                onUpdate={(updates) => updateSetInWorkout(set.id, updates)}
                onComplete={() => handleCompleteSet(set)}
                onDelete={() => deleteSetFromWorkout(set.id)}
              />
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(group.exerciseId, group.exerciseName)}
            >
              <Ionicons name="add" size={20} color={StrongColors.strongBlue} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
          <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Set Row Component
interface SetRowProps {
  set: WorkoutSet;
  setNumber: number;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
  onComplete: () => void;
  onDelete: () => void;
}

const SetRow: React.FC<SetRowProps> = ({
  set,
  setNumber,
  onUpdate,
  onComplete,
  onDelete,
}) => {
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());

  const handleWeightBlur = () => {
    const value = parseFloat(weight) || 0;
    onUpdate({ weight: value });
  };

  const handleRepsBlur = () => {
    const value = parseInt(reps, 10) || 0;
    onUpdate({ reps: value });
  };

  return (
    <View style={[styles.setRow, set.isCompleted && styles.setRowCompleted]}>
      <Text style={[styles.setNumber, { flex: 0.5 }]}>{setNumber}</Text>
      <TextInput
        style={[styles.setInput, { flex: 1 }]}
        value={weight}
        onChangeText={setWeight}
        onBlur={handleWeightBlur}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={StrongColors.textTertiary}
      />
      <TextInput
        style={[styles.setInput, { flex: 1 }]}
        value={reps}
        onChangeText={setReps}
        onBlur={handleRepsBlur}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={StrongColors.textTertiary}
      />
      <TouchableOpacity
        style={[styles.checkButton, set.isCompleted && styles.checkButtonCompleted]}
        onPress={onComplete}
      >
        <Ionicons
          name={set.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={set.isCompleted ? StrongColors.strongGreen : StrongColors.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: StrongColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: StrongColors.border,
  },
  cancelButton: {
    ...Typography.body,
    color: StrongColors.strongRed,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  timer: {
    ...Typography.title3,
    fontVariant: ['tabular-nums'],
  },
  finishButton: {
    ...Typography.body,
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  exerciseCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseName: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: StrongColors.border,
  },
  setHeaderText: {
    ...Typography.caption1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: StrongColors.border,
  },
  setRowCompleted: {
    backgroundColor: `${StrongColors.strongGreen}10`,
  },
  setNumber: {
    ...Typography.body,
    textAlign: 'center',
    fontWeight: '600',
  },
  setInput: {
    ...Typography.body,
    textAlign: 'center',
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
  },
  checkButton: {
    flex: 0.5,
    alignItems: 'center',
  },
  checkButtonCompleted: {},
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  addSetText: {
    ...Typography.callout,
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  addExerciseText: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
  },
  restTimerOverlay: {
    position: 'absolute',
    top: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  restTimerLabel: {
    ...Typography.subheadline,
    marginBottom: Spacing.sm,
  },
  restTimerTime: {
    fontSize: 48,
    fontWeight: '700',
    color: StrongColors.strongBlue,
    fontVariant: ['tabular-nums'],
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.inputBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  addTimeText: {
    ...Typography.callout,
    fontWeight: '600',
  },
  dismissTimerButton: {
    marginTop: Spacing.md,
  },
  dismissTimerText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  restTimerModal: {
    position: 'absolute',
    top: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  restTimerModalTitle: {
    ...Typography.headline,
    marginBottom: Spacing.lg,
  },
  restTimerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  restTimerOption: {
    backgroundColor: StrongColors.inputBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  restTimerOptionText: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
  },
  skipTimerButton: {
    marginTop: Spacing.lg,
  },
  skipTimerText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
});
