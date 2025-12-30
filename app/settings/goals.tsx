import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';

import { useData } from '@/contexts/DataContext';
import {
  UserProfile,
  Gender,
  GoalType,
  ActivityLevel,
} from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

const GENDERS: Gender[] = ['Male', 'Female'];
const GOAL_TYPES: GoalType[] = ['Lose', 'Maintain', 'Gain'];
const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'Sedentary', label: 'Sedentary (little to no exercise)' },
  { value: 'Light', label: 'Light (exercise 1-3 days/week)' },
  { value: 'Moderate', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'Active', label: 'Active (exercise 6-7 days/week)' },
  { value: 'Very Active', label: 'Very Active (hard exercise daily)' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile, updateUserProfile } = useData();

  const [gender, setGender] = useState<Gender>(
    userProfile?.selectedGender || 'Male'
  );
  const [birthday, setBirthday] = useState<Date>(
    userProfile?.birthday ? new Date(userProfile.birthday) : new Date(1990, 0, 1)
  );
  const [goalType, setGoalType] = useState<GoalType>(
    userProfile?.goalType || 'Maintain'
  );
  const [targetRate, setTargetRate] = useState(
    userProfile?.targetWeeklyRate || 0.5
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    userProfile?.activityLevel || 'Moderate'
  );
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(
    userProfile?.workoutsPerWeekGoal || 5
  );

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    const profile: UserProfile = {
      id: userProfile?.id || uuidv4(),
      selectedGender: gender,
      birthday: birthday.toISOString(),
      goalType,
      targetWeeklyRate: targetRate,
      activityLevel,
      workoutsPerWeekGoal: workoutsPerWeek,
    };

    await updateUserProfile(profile);
    router.back();
  };

  const calculateAge = () => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Set Goals',
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
        {/* Personal Details Section */}
        <Text style={styles.sectionHeader}>Personal Details</Text>
        <View style={styles.card}>
          {/* Gender */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gender</Text>
            <View style={styles.segmentedControl}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.segment,
                    gender === g && styles.segmentActive,
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      gender === g && styles.segmentTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Birthday */}
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.rowLabel}>Date of Birth</Text>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>
                {birthday.toLocaleDateString()} ({calculateAge()} years)
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={StrongColors.textTertiary}
              />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setBirthday(date);
              }}
              maximumDate={new Date()}
            />
          )}

          <View style={styles.divider} />

          {/* Activity Level */}
          <View style={styles.activitySection}>
            <Text style={styles.rowLabel}>Activity Level</Text>
            <View style={styles.activityOptions}>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.activityOption,
                    activityLevel === level.value && styles.activityOptionActive,
                  ]}
                  onPress={() => setActivityLevel(level.value)}
                >
                  <Text
                    style={[
                      styles.activityOptionText,
                      activityLevel === level.value &&
                        styles.activityOptionTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Fitness Goal Section */}
        <Text style={styles.sectionHeader}>Fitness Goal</Text>
        <View style={styles.card}>
          {/* Goal Type */}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Goal</Text>
            <View style={styles.segmentedControl}>
              {GOAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.segment,
                    goalType === type && styles.segmentActive,
                  ]}
                  onPress={() => setGoalType(type)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      goalType === type && styles.segmentTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {goalType !== 'Maintain' && (
            <>
              <View style={styles.divider} />

              {/* Target Rate */}
              <View style={styles.rateSection}>
                <Text style={styles.rowLabel}>
                  Target Rate (lbs/week)
                </Text>
                <View style={styles.rateOptions}>
                  {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0].map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.rateChip,
                        targetRate === rate && styles.rateChipActive,
                      ]}
                      onPress={() => setTargetRate(rate)}
                    >
                      <Text
                        style={[
                          styles.rateChipText,
                          targetRate === rate && styles.rateChipTextActive,
                        ]}
                      >
                        {rate}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Workout Goal Section */}
        <Text style={styles.sectionHeader}>Workout Goal</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Workouts per Week</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setWorkoutsPerWeek(Math.max(1, workoutsPerWeek - 1))}
              >
                <Ionicons name="remove" size={20} color={StrongColors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{workoutsPerWeek}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setWorkoutsPerWeek(Math.min(7, workoutsPerWeek + 1))}
              >
                <Ionicons name="add" size={20} color={StrongColors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
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
  saveButton: {
    ...Typography.body,
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  sectionHeader: {
    ...CommonStyles.sectionHeader,
  },
  card: {
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    ...Typography.body,
  },
  rowValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowValueText: {
    ...Typography.body,
    color: StrongColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: StrongColors.border,
    marginVertical: Spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  segment: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  segmentActive: {
    backgroundColor: StrongColors.strongBlue,
  },
  segmentText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  segmentTextActive: {
    color: StrongColors.textPrimary,
    fontWeight: '600',
  },
  activitySection: {
    gap: Spacing.md,
  },
  activityOptions: {
    gap: Spacing.sm,
  },
  activityOption: {
    padding: Spacing.md,
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activityOptionActive: {
    borderColor: StrongColors.strongBlue,
    backgroundColor: `${StrongColors.strongBlue}20`,
  },
  activityOptionText: {
    ...Typography.body,
    color: StrongColors.textSecondary,
  },
  activityOptionTextActive: {
    color: StrongColors.textPrimary,
  },
  rateSection: {
    gap: Spacing.md,
  },
  rateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  rateChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rateChipActive: {
    borderColor: StrongColors.strongBlue,
    backgroundColor: StrongColors.strongBlue,
  },
  rateChipText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  rateChipTextActive: {
    color: StrongColors.textPrimary,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepperButton: {
    width: 36,
    height: 36,
    backgroundColor: StrongColors.inputBackground,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    ...Typography.title3,
    minWidth: 30,
    textAlign: 'center',
  },
});
