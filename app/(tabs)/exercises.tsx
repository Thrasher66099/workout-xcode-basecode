import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useData } from '@/contexts/DataContext';
import { Exercise, BodyPart } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

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

export default function ExercisesScreen() {
  const router = useRouter();
  const { exercises, isLoading } = useData();
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

  // Group exercises by body part
  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    filteredExercises.forEach((exercise) => {
      if (!groups[exercise.bodyPart]) {
        groups[exercise.bodyPart] = [];
      }
      groups[exercise.bodyPart].push(exercise);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredExercises]);

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => router.push(`/exercise/${item.id}`)}
    >
      <View style={styles.exerciseIcon}>
        <Ionicons name="barbell" size={20} color={StrongColors.strongBlue} />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseType}>{item.type}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={StrongColors.textTertiary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={StrongColors.strongBlue} />
      </View>
    );
  }

  return (
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
          style={styles.addButton}
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
        data={groupedExercises}
        keyExtractor={([bodyPart]) => bodyPart}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: [bodyPart, bodyPartExercises] }) => (
          <View style={styles.bodyPartSection}>
            <Text style={styles.bodyPartHeader}>{bodyPart}</Text>
            {bodyPartExercises.map((exercise) => (
              <React.Fragment key={exercise.id}>
                {renderExerciseItem({ item: exercise })}
              </React.Fragment>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={StrongColors.textTertiary} />
            <Text style={styles.emptyStateText}>No exercises found</Text>
          </View>
        }
      />
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
  addButton: {
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
    gap: Spacing.sm,
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
  bodyPartSection: {
    marginBottom: Spacing.lg,
  },
  bodyPartHeader: {
    ...Typography.footnote,
    color: StrongColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
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
