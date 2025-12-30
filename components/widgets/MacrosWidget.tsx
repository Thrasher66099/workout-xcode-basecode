import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useData } from '@/contexts/DataContext';
import { calculateDailyMacros } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export const MacrosWidget: React.FC = () => {
  const { userProfile, measurements, getMeasurementsByType } = useData();

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Daily Macros</Text>
        <Text style={styles.emptyText}>
          Set up your profile to see macro targets
        </Text>
      </View>
    );
  }

  // Get current weight from measurements or use a default
  const weightMeasurements = getMeasurementsByType('Weight');
  const currentWeight = weightMeasurements.length > 0 ? weightMeasurements[0].value : 150;
  const heightInches = 70; // Default height, could be added to profile

  const macros = calculateDailyMacros(userProfile, currentWeight, heightInches);

  const MacroRing: React.FC<{
    label: string;
    value: number;
    unit: string;
    color: string;
    total?: number;
  }> = ({ label, value, unit, color }) => (
    <View style={styles.macroItem}>
      <View style={[styles.macroRing, { borderColor: color }]}>
        <Text style={[styles.macroValue, { color }]}>{value}</Text>
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroUnit}>{unit}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Macro Targets</Text>

      <View style={styles.macrosContainer}>
        <MacroRing
          label="Calories"
          value={macros.calories}
          unit="kcal"
          color={StrongColors.strongBlue}
        />
        <MacroRing
          label="Protein"
          value={macros.protein}
          unit="g"
          color="#EF4444"
        />
        <MacroRing
          label="Carbs"
          value={macros.carbs}
          unit="g"
          color="#F59E0B"
        />
        <MacroRing
          label="Fat"
          value={macros.fat}
          unit="g"
          color="#8B5CF6"
        />
      </View>

      <View style={styles.goalInfo}>
        <Text style={styles.goalText}>
          Based on your {userProfile.goalType.toLowerCase()} weight goal
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headline,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    ...Typography.subheadline,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  macroValue: {
    ...Typography.headline,
    fontSize: 14,
  },
  macroLabel: {
    ...Typography.caption1,
    marginBottom: 2,
  },
  macroUnit: {
    ...Typography.caption2,
  },
  goalInfo: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: StrongColors.border,
  },
  goalText: {
    ...Typography.caption1,
    textAlign: 'center',
  },
});
