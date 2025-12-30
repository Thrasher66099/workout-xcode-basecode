import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';
import { WorkoutsPerWeekWidget } from '@/components/widgets/WorkoutsPerWeekWidget';
import { MacrosWidget } from '@/components/widgets/MacrosWidget';
import { MeasurementWidget } from '@/components/widgets/MeasurementWidget';
import { ExerciseWidget } from '@/components/widgets/ExerciseWidget';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workouts, widgets, userProfile, isLoading } = useData();

  const totalWorkouts = workouts.length;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={StrongColors.strongBlue} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={StrongColors.textSecondary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.username}>Athlete</Text>
          <Text style={styles.workoutCount}>{totalWorkouts} workouts logged</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/settings/goals')}
        >
          <Ionicons name="flag" size={20} color={StrongColors.strongBlue} />
          <Text style={styles.actionButtonText}>Set Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/settings/add-widget')}
        >
          <Ionicons name="add-circle" size={20} color={StrongColors.strongBlue} />
          <Text style={styles.actionButtonText}>Add Widget</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Widgets */}
      <Text style={styles.sectionHeader}>Dashboard</Text>

      {/* Default widgets if none configured */}
      {widgets.length === 0 ? (
        <>
          <WorkoutsPerWeekWidget />
          {userProfile && <MacrosWidget />}
        </>
      ) : (
        widgets
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((widget) => {
            switch (widget.type) {
              case 'workouts':
                return <WorkoutsPerWeekWidget key={widget.id} />;
              case 'macros':
                return <MacrosWidget key={widget.id} />;
              case 'measurement':
                return widget.measurementType ? (
                  <MeasurementWidget
                    key={widget.id}
                    measurementType={widget.measurementType}
                  />
                ) : null;
              case 'exercise':
                return widget.exerciseId && widget.exerciseMetric ? (
                  <ExerciseWidget
                    key={widget.id}
                    exerciseId={widget.exerciseId}
                    metric={widget.exerciseMetric}
                  />
                ) : null;
              default:
                return null;
            }
          })
      )}

      {/* Empty state for no widgets */}
      {widgets.length === 0 && !userProfile && (
        <View style={styles.emptyState}>
          <Ionicons name="grid-outline" size={48} color={StrongColors.textTertiary} />
          <Text style={styles.emptyStateText}>
            Add widgets to customize your dashboard
          </Text>
          <TouchableOpacity
            style={CommonStyles.primaryButton}
            onPress={() => router.push('/settings/add-widget')}
          >
            <Text style={CommonStyles.primaryButtonText}>Add Widget</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
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
  content: {
    padding: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: StrongColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    ...Typography.title2,
    marginBottom: Spacing.xs,
  },
  workoutCount: {
    ...Typography.subheadline,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  actionButtonText: {
    ...Typography.callout,
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  emptyStateText: {
    ...Typography.subheadline,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
