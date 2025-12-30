import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { BodyPart, ExerciseType } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

const BODY_PARTS: BodyPart[] = [
  'Chest',
  'Back',
  'Legs',
  'Arms',
  'Shoulders',
  'Core',
  'Cardio',
  'Other',
];

const EXERCISE_TYPES: ExerciseType[] = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Weighted Bodyweight',
  'Assisted Bodyweight',
  'Reps Only',
  'Cardio',
  'Duration',
  'Other',
];

export default function CreateExerciseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addExercise } = useData();

  const [name, setName] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart>('Chest');
  const [exerciseType, setExerciseType] = useState<ExerciseType>('Barbell');
  const [instructions, setInstructions] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    await addExercise({
      name: name.trim(),
      bodyPart,
      type: exerciseType,
      instructions: instructions.trim(),
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Exercise',
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
        {/* Exercise Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Exercise Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Dumbbell Fly"
            placeholderTextColor={StrongColors.textTertiary}
            autoFocus
          />
        </View>

        {/* Body Part */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Body Part</Text>
          <View style={styles.optionsGrid}>
            {BODY_PARTS.map((part) => (
              <TouchableOpacity
                key={part}
                style={[
                  styles.optionChip,
                  bodyPart === part && styles.optionChipActive,
                ]}
                onPress={() => setBodyPart(part)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    bodyPart === part && styles.optionChipTextActive,
                  ]}
                >
                  {part}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exercise Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Equipment Type</Text>
          <View style={styles.optionsGrid}>
            {EXERCISE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionChip,
                  exerciseType === type && styles.optionChipActive,
                ]}
                onPress={() => setExerciseType(type)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    exerciseType === type && styles.optionChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Step-by-step instructions..."
            placeholderTextColor={StrongColors.textTertiary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
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
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...CommonStyles.inputLabel,
  },
  input: {
    ...CommonStyles.input,
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: StrongColors.border,
  },
  optionChipActive: {
    backgroundColor: StrongColors.strongBlue,
    borderColor: StrongColors.strongBlue,
  },
  optionChipText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  optionChipTextActive: {
    color: StrongColors.textPrimary,
    fontWeight: '600',
  },
});
