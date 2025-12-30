import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useData } from '@/contexts/DataContext';
import { WidgetType, MeasurementType, ExerciseMetric, Exercise } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

type Step = 'main' | 'measurement' | 'exercise' | 'metric';

const MEASUREMENT_TYPES: MeasurementType[] = [
  'Weight',
  'Body Fat',
  'Chest',
  'Waist',
  'Hips',
  'Left Bicep',
  'Right Bicep',
  'Left Thigh',
  'Right Thigh',
  'Shoulders',
  'Neck',
];

const EXERCISE_METRICS: { value: ExerciseMetric; description: string }[] = [
  { value: 'Est. 1RM', description: 'Estimated one rep max' },
  { value: 'Max Weight', description: 'Heaviest weight lifted' },
  { value: 'Volume', description: 'Total weight × reps' },
  { value: 'Max Reps', description: 'Most reps in a set' },
  { value: 'Best Set', description: 'Best single set performance' },
];

export default function AddWidgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { exercises, addWidget } = useData();

  const [step, setStep] = useState<Step>('main');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleAddWidget = async (type: WidgetType, options?: any) => {
    await addWidget({
      type,
      sortOrder: 0,
      ...options,
    });
    router.back();
  };

  const renderMainStep = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text style={styles.sectionHeader}>Workout & Nutrition</Text>

      <TouchableOpacity
        style={styles.widgetOption}
        onPress={() => handleAddWidget('workouts')}
      >
        <View style={styles.widgetIcon}>
          <Ionicons name="bar-chart" size={24} color={StrongColors.strongBlue} />
        </View>
        <View style={styles.widgetInfo}>
          <Text style={styles.widgetTitle}>Workouts Per Week</Text>
          <Text style={styles.widgetDescription}>
            Track your weekly workout consistency
          </Text>
        </View>
        <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.widgetOption}
        onPress={() => handleAddWidget('macros')}
      >
        <View style={styles.widgetIcon}>
          <Ionicons name="nutrition" size={24} color={StrongColors.strongBlue} />
        </View>
        <View style={styles.widgetInfo}>
          <Text style={styles.widgetTitle}>Daily Macros</Text>
          <Text style={styles.widgetDescription}>
            View your daily macro targets
          </Text>
        </View>
        <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Measurements</Text>

      <TouchableOpacity
        style={styles.widgetOption}
        onPress={() => setStep('measurement')}
      >
        <View style={styles.widgetIcon}>
          <Ionicons name="analytics" size={24} color={StrongColors.strongBlue} />
        </View>
        <View style={styles.widgetInfo}>
          <Text style={styles.widgetTitle}>Measurement Tracking</Text>
          <Text style={styles.widgetDescription}>
            Track a body measurement over time
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={StrongColors.textTertiary} />
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Exercise Analytics</Text>

      <TouchableOpacity
        style={styles.widgetOption}
        onPress={() => setStep('exercise')}
      >
        <View style={styles.widgetIcon}>
          <Ionicons name="barbell" size={24} color={StrongColors.strongBlue} />
        </View>
        <View style={styles.widgetInfo}>
          <Text style={styles.widgetTitle}>Exercise Progress</Text>
          <Text style={styles.widgetDescription}>
            Track progress for a specific exercise
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={StrongColors.textTertiary} />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMeasurementStep = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text style={styles.sectionHeader}>Select Measurement</Text>

      {MEASUREMENT_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={styles.listItem}
          onPress={() => handleAddWidget('measurement', { measurementType: type })}
        >
          <Text style={styles.listItemText}>{type}</Text>
          <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderExerciseStep = () => (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + 20 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            setSelectedExercise(item);
            setStep('metric');
          }}
        >
          <View>
            <Text style={styles.listItemText}>{item.name}</Text>
            <Text style={styles.listItemSubtext}>{item.bodyPart}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={StrongColors.textTertiary} />
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <Text style={[styles.sectionHeader, { marginTop: 0 }]}>Select Exercise</Text>
      }
    />
  );

  const renderMetricStep = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text style={styles.sectionHeader}>Select Metric for {selectedExercise?.name}</Text>

      {EXERCISE_METRICS.map(({ value, description }) => (
        <TouchableOpacity
          key={value}
          style={styles.listItem}
          onPress={() =>
            handleAddWidget('exercise', {
              exerciseId: selectedExercise?.id,
              exerciseMetric: value,
            })
          }
        >
          <View>
            <Text style={styles.listItemText}>{value}</Text>
            <Text style={styles.listItemSubtext}>{description}</Text>
          </View>
          <Ionicons name="add-circle" size={24} color={StrongColors.strongBlue} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const getTitle = () => {
    switch (step) {
      case 'measurement':
        return 'Select Measurement';
      case 'exercise':
        return 'Select Exercise';
      case 'metric':
        return 'Select Metric';
      default:
        return 'Add Widget';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: getTitle(),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (step === 'main') {
                  router.back();
                } else if (step === 'metric') {
                  setStep('exercise');
                } else {
                  setStep('main');
                }
              }}
            >
              <Ionicons
                name={step === 'main' ? 'close' : 'arrow-back'}
                size={24}
                color={StrongColors.textPrimary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {step === 'main' && renderMainStep()}
        {step === 'measurement' && renderMeasurementStep()}
        {step === 'exercise' && renderExerciseStep()}
        {step === 'metric' && renderMetricStep()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StrongColors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
  },
  widgetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  widgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: StrongColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetTitle: {
    ...Typography.headline,
    marginBottom: 2,
  },
  widgetDescription: {
    ...Typography.caption1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listItemText: {
    ...Typography.body,
  },
  listItemSubtext: {
    ...Typography.caption1,
    marginTop: 2,
  },
});
