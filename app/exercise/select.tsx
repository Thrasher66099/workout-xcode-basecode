import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '@/contexts/DataContext';
import { Exercise, BodyPart } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography } from '@/constants/theme';

const BODY_PARTS: (BodyPart | 'All')[] = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Arms',
  'Shoulders',
  'Core',
  'Cardio',
  'Other',
];

export default function ExerciseSelectScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: 'workout' | 'routine' }>();
  const { exercises, addExerciseToWorkout } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | 'All'>('All');

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.bodyPart.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBodyPart =
        selectedBodyPart === 'All' || exercise.bodyPart === selectedBodyPart;
      return matchesSearch && matchesBodyPart;
    });
  }, [exercises, searchQuery, selectedBodyPart]);

  const handleSelectExercise = (exercise: Exercise) => {
    if (mode === 'workout') {
      addExerciseToWorkout(exercise.id);
      router.back();
    } else if (mode === 'routine') {
      // For routine mode, we need to pass back the selected exercise
      // This will be handled by the parent screen
      router.back();
      // In a real app, you'd use a callback or global state
    } else {
      router.back();
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleSelectExercise(item)}
    >
      <View style={styles.exerciseIcon}>
        <Ionicons name="barbell" size={20} color={StrongColors.strongBlue} />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseType}>
          {item.bodyPart} • {item.type}
        </Text>
      </View>
      <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Exercise',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={StrongColors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={StrongColors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={StrongColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/exercise/create')}
          >
            <Ionicons name="add" size={24} color={StrongColors.strongBlue} />
          </TouchableOpacity>
        </View>

        {/* Body Part Filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BODY_PARTS}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedBodyPart === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedBodyPart(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedBodyPart === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          renderItem={renderExerciseItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={StrongColors.textTertiary} />
              <Text style={styles.emptyStateText}>No exercises found</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StrongColors.background,
  },
  cancelButton: {
    ...Typography.body,
    color: StrongColors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: StrongColors.textPrimary,
    fontSize: 16,
  },
  createButton: {
    width: 44,
    height: 44,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: StrongColors.strongBlue,
  },
  filterChipText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  filterChipTextActive: {
    color: StrongColors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: StrongColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...Typography.headline,
    marginBottom: 2,
  },
  exerciseType: {
    ...Typography.caption1,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyStateText: {
    ...Typography.subheadline,
    marginTop: Spacing.md,
  },
});
