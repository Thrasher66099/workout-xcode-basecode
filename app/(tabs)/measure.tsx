import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { MeasurementType, MeasurementLog } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

const MEASUREMENT_CATEGORIES: {
  title: string;
  types: { type: MeasurementType; icon: string }[];
}[] = [
  {
    title: 'Body Composition',
    types: [
      { type: 'Weight', icon: 'scale' },
      { type: 'Body Fat', icon: 'fitness' },
    ],
  },
  {
    title: 'Upper Body',
    types: [
      { type: 'Chest', icon: 'body' },
      { type: 'Shoulders', icon: 'body' },
      { type: 'Left Bicep', icon: 'body' },
      { type: 'Right Bicep', icon: 'body' },
      { type: 'Left Forearm', icon: 'body' },
      { type: 'Right Forearm', icon: 'body' },
      { type: 'Left Wrist', icon: 'body' },
      { type: 'Right Wrist', icon: 'body' },
      { type: 'Neck', icon: 'body' },
    ],
  },
  {
    title: 'Lower Body',
    types: [
      { type: 'Waist', icon: 'body' },
      { type: 'Hips', icon: 'body' },
      { type: 'Left Thigh', icon: 'body' },
      { type: 'Right Thigh', icon: 'body' },
      { type: 'Left Calf', icon: 'body' },
      { type: 'Right Calf', icon: 'body' },
    ],
  },
];

export default function MeasureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { measurements, getMeasurementsByType, isLoading } = useData();
  const [expandedType, setExpandedType] = useState<MeasurementType | null>(null);

  const getLatestMeasurement = (type: MeasurementType) => {
    const typeMeasurements = getMeasurementsByType(type);
    return typeMeasurements.length > 0 ? typeMeasurements[0] : null;
  };

  const handleLogMeasurement = (type: MeasurementType) => {
    router.push(`/measure/log?type=${encodeURIComponent(type)}`);
  };

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
      {MEASUREMENT_CATEGORIES.map((category) => (
        <View key={category.title} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          {category.types.map(({ type, icon }) => {
            const latest = getLatestMeasurement(type);
            const typeMeasurements = getMeasurementsByType(type);
            const isExpanded = expandedType === type;

            return (
              <View key={type}>
                <TouchableOpacity
                  style={styles.measurementCard}
                  onPress={() =>
                    setExpandedType(isExpanded ? null : type)
                  }
                >
                  <View style={styles.measurementIcon}>
                    <Ionicons
                      name={icon as any}
                      size={20}
                      color={StrongColors.strongBlue}
                    />
                  </View>
                  <View style={styles.measurementInfo}>
                    <Text style={styles.measurementType}>{type}</Text>
                    {latest ? (
                      <Text style={styles.measurementValue}>
                        {latest.value} {latest.unit}
                      </Text>
                    ) : (
                      <Text style={styles.measurementEmpty}>No data</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.logButton}
                    onPress={() => handleLogMeasurement(type)}
                  >
                    <Ionicons name="add" size={20} color={StrongColors.strongBlue} />
                  </TouchableOpacity>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={StrongColors.textTertiary}
                  />
                </TouchableOpacity>

                {/* Expanded History */}
                {isExpanded && typeMeasurements.length > 0 && (
                  <View style={styles.historyContainer}>
                    {typeMeasurements.slice(0, 10).map((measurement) => (
                      <View key={measurement.id} style={styles.historyItem}>
                        <Text style={styles.historyDate}>
                          {format(parseISO(measurement.date), 'MMM d, yyyy')}
                        </Text>
                        <Text style={styles.historyValue}>
                          {measurement.value} {measurement.unit}
                        </Text>
                      </View>
                    ))}
                    {typeMeasurements.length > 10 && (
                      <Text style={styles.moreHistory}>
                        +{typeMeasurements.length - 10} more entries
                      </Text>
                    )}
                  </View>
                )}

                {isExpanded && typeMeasurements.length === 0 && (
                  <View style={styles.historyContainer}>
                    <Text style={styles.noHistoryText}>
                      No measurements logged yet
                    </Text>
                    <TouchableOpacity
                      style={CommonStyles.primaryButton}
                      onPress={() => handleLogMeasurement(type)}
                    >
                      <Text style={CommonStyles.primaryButtonText}>
                        Log First Measurement
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
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
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    ...Typography.footnote,
    color: StrongColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  measurementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  measurementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: StrongColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementType: {
    ...Typography.headline,
    marginBottom: 2,
  },
  measurementValue: {
    ...Typography.subheadline,
    color: StrongColors.strongBlue,
  },
  measurementEmpty: {
    ...Typography.subheadline,
    color: StrongColors.textTertiary,
  },
  logButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: StrongColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  historyContainer: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: StrongColors.border,
  },
  historyDate: {
    ...Typography.body,
    color: StrongColors.textSecondary,
  },
  historyValue: {
    ...Typography.body,
    fontWeight: '600',
  },
  moreHistory: {
    ...Typography.caption1,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  noHistoryText: {
    ...Typography.subheadline,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
