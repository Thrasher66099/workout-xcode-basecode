import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { calculateEstimated1RM } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

type TabType = 'about' | 'history' | 'records';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExerciseById, getExerciseRecords, workouts } = useData();

  const [activeTab, setActiveTab] = useState<TabType>('about');

  const exercise = getExerciseById(id);
  const records = getExerciseRecords(id);

  // Get history for this exercise
  const exerciseHistory = useMemo(() => {
    if (!id) return [];

    return workouts
      .filter((w) => w.sets.some((s) => s.exerciseId === id && s.isCompleted))
      .map((w) => ({
        date: w.startTime,
        sets: w.sets.filter((s) => s.exerciseId === id && s.isCompleted),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts, id]);

  if (!exercise) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.emptyText}>Exercise not found</Text>
        <TouchableOpacity
          style={CommonStyles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={CommonStyles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Body Part</Text>
          <Text style={styles.infoValue}>{exercise.bodyPart}</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equipment</Text>
          <Text style={styles.infoValue}>{exercise.type}</Text>
        </View>
      </View>

      {exercise.instructions && (
        <>
          <Text style={styles.sectionHeader}>Instructions</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>{exercise.instructions}</Text>
          </View>
        </>
      )}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      {exerciseHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={StrongColors.textTertiary} />
          <Text style={styles.emptyStateText}>No history yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Complete a workout with this exercise to see your history
          </Text>
        </View>
      ) : (
        exerciseHistory.map((session, index) => (
          <View key={index} style={styles.historyCard}>
            <Text style={styles.historyDate}>
              {format(parseISO(session.date), 'EEEE, MMM d, yyyy')}
            </Text>
            {session.sets.map((set, setIndex) => (
              <View key={set.id} style={styles.historySet}>
                <Text style={styles.historySetNumber}>{setIndex + 1}</Text>
                <Text style={styles.historySetText}>
                  {set.weight} kg x {set.reps} reps
                </Text>
                {set.rpe && (
                  <Text style={styles.historyRpe}>RPE {set.rpe}</Text>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );

  const renderRecordsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.recordsGrid}>
        <View style={styles.recordCard}>
          <Text style={styles.recordValue}>
            {records.max1RM > 0 ? `${records.max1RM} kg` : '--'}
          </Text>
          <Text style={styles.recordLabel}>Est. 1RM</Text>
        </View>

        <View style={styles.recordCard}>
          <Text style={styles.recordValue}>
            {records.maxWeight > 0 ? `${records.maxWeight} kg` : '--'}
          </Text>
          <Text style={styles.recordLabel}>Max Weight</Text>
        </View>

        <View style={styles.recordCard}>
          <Text style={styles.recordValue}>
            {records.maxVolume > 0 ? `${records.maxVolume} kg` : '--'}
          </Text>
          <Text style={styles.recordLabel}>Best Volume</Text>
        </View>

        <View style={styles.recordCard}>
          <Text style={styles.recordValue}>
            {records.maxReps > 0 ? records.maxReps : '--'}
          </Text>
          <Text style={styles.recordLabel}>Max Reps</Text>
        </View>
      </View>

      <View style={styles.infoNote}>
        <Ionicons name="information-circle" size={20} color={StrongColors.textSecondary} />
        <Text style={styles.infoNoteText}>
          Est. 1RM is calculated using the Epley formula
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: exercise.name,
        }}
      />
      <View style={styles.container}>
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {(['about', 'history', 'records'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {activeTab === 'about' && renderAboutTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'records' && renderRecordsTab()}
        </ScrollView>
      </View>
    </>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: StrongColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: StrongColors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: StrongColors.strongBlue,
  },
  tabText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  tabTextActive: {
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
  },
  infoCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.body,
    color: StrongColors.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: StrongColors.border,
    marginVertical: Spacing.md,
  },
  instructionsCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  instructionsText: {
    ...Typography.body,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyStateText: {
    ...Typography.headline,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.subheadline,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  historyDate: {
    ...Typography.headline,
    marginBottom: Spacing.md,
  },
  historySet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  historySetNumber: {
    ...Typography.callout,
    fontWeight: '600',
    width: 30,
  },
  historySetText: {
    ...Typography.body,
    flex: 1,
  },
  historyRpe: {
    ...Typography.caption1,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  recordCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  recordValue: {
    ...Typography.title2,
    color: StrongColors.strongBlue,
    marginBottom: Spacing.xs,
  },
  recordLabel: {
    ...Typography.caption1,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
  },
  infoNoteText: {
    ...Typography.caption1,
    flex: 1,
  },
});
