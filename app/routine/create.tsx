import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '@/contexts/DataContext';
import { Routine, RoutineExercise, RoutineSet } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

export default function CreateRoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { routines, addRoutine, updateRoutine, getExerciseById } = useData();

  const isEditing = !!id;
  const existingRoutine = routines.find((r) => r.id === id);

  const [name, setName] = useState(existingRoutine?.name || '');
  const [folder, setFolder] = useState(existingRoutine?.folder || 'My Routines');
  const [exercises, setExercises] = useState<RoutineExercise[]>(
    existingRoutine?.exercises || []
  );

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const routineData: Omit<Routine, 'id'> = {
      name: name.trim(),
      folder: folder.trim() || 'My Routines',
      exercises,
    };

    if (isEditing && existingRoutine) {
      await updateRoutine({ ...routineData, id: existingRoutine.id });
    } else {
      await addRoutine(routineData);
    }

    router.back();
  };

  const handleAddExercise = () => {
    router.push('/exercise/select?mode=routine');
  };

  // Listen for exercise selection
  useEffect(() => {
    const handleExerciseSelected = (exerciseId: string) => {
      const exercise = getExerciseById(exerciseId);
      if (exercise) {
        const newRoutineExercise: RoutineExercise = {
          id: uuidv4(),
          exerciseId: exercise.id,
          name: exercise.name,
          sets: [
            { id: uuidv4(), weight: 0, reps: 0 },
            { id: uuidv4(), weight: 0, reps: 0 },
            { id: uuidv4(), weight: 0, reps: 0 },
          ],
        };
        setExercises((prev) => [...prev, newRoutineExercise]);
      }
    };

    // This would be handled by navigation params in a real app
    // For now, we'll check if there's a selected exercise
  }, []);

  const handleRemoveExercise = (exerciseId: string) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
          },
        },
      ]
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id === exerciseId) {
          const lastSet = e.sets[e.sets.length - 1];
          return {
            ...e,
            sets: [
              ...e.sets,
              {
                id: uuidv4(),
                weight: lastSet?.weight || 0,
                reps: lastSet?.reps || 0,
              },
            ],
          };
        }
        return e;
      })
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          };
        }
        return e;
      })
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    updates: Partial<RoutineSet>
  ) => {
    setExercises((prev) =>
      prev.map((e) => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
          };
        }
        return e;
      })
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Routine' : 'Create Routine',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Routine Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Routine Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Push Day"
            placeholderTextColor={StrongColors.textTertiary}
          />
        </View>

        {/* Folder */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Folder</Text>
          <TextInput
            style={styles.input}
            value={folder}
            onChangeText={setFolder}
            placeholder="My Routines"
            placeholderTextColor={StrongColors.textTertiary}
          />
        </View>

        {/* Exercises */}
        <Text style={styles.sectionHeader}>Exercises</Text>

        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveExercise(exercise.id)}>
                <Ionicons name="close-circle" size={22} color={StrongColors.strongRed} />
              </TouchableOpacity>
            </View>

            {/* Set Headers */}
            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { flex: 0.5 }]}>SET</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
              <View style={{ flex: 0.3 }} />
            </View>

            {/* Sets */}
            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setNumber, { flex: 0.5 }]}>{index + 1}</Text>
                <TextInput
                  style={[styles.setInput, { flex: 1 }]}
                  value={set.weight > 0 ? set.weight.toString() : ''}
                  onChangeText={(text) =>
                    handleUpdateSet(exercise.id, set.id, {
                      weight: parseFloat(text) || 0,
                    })
                  }
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={StrongColors.textTertiary}
                />
                <TextInput
                  style={[styles.setInput, { flex: 1 }]}
                  value={set.reps > 0 ? set.reps.toString() : ''}
                  onChangeText={(text) =>
                    handleUpdateSet(exercise.id, set.id, {
                      reps: parseInt(text, 10) || 0,
                    })
                  }
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={StrongColors.textTertiary}
                />
                <TouchableOpacity
                  style={{ flex: 0.3, alignItems: 'center' }}
                  onPress={() => handleRemoveSet(exercise.id, set.id)}
                >
                  <Ionicons name="remove-circle-outline" size={20} color={StrongColors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Set Button */}
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(exercise.id)}
            >
              <Ionicons name="add" size={18} color={StrongColors.strongBlue} />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StrongColors.background,
    padding: Spacing.lg,
  },
  cancelButton: {
    ...Typography.body,
    color: StrongColors.textSecondary,
  },
  saveButton: {
    ...Typography.body,
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...CommonStyles.inputLabel,
  },
  input: {
    ...CommonStyles.input,
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
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
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  addSetText: {
    ...Typography.callout,
    color: StrongColors.strongBlue,
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
});
