import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { useData } from '@/contexts/DataContext';
import { MeasurementType, MeasurementUnit } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography, CommonStyles } from '@/constants/theme';

const getDefaultUnit = (type: MeasurementType): MeasurementUnit => {
  switch (type) {
    case 'Weight':
      return 'lb';
    case 'Body Fat':
      return '%';
    default:
      return 'in';
  }
};

const getUnitOptions = (type: MeasurementType): MeasurementUnit[] => {
  switch (type) {
    case 'Weight':
      return ['lb', 'kg'];
    case 'Body Fat':
      return ['%'];
    default:
      return ['in', 'cm'];
  }
};

export default function LogMeasurementScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { addMeasurement } = useData();

  const measurementType = (decodeURIComponent(type || 'Weight')) as MeasurementType;
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<MeasurementUnit>(getDefaultUnit(measurementType));
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const unitOptions = getUnitOptions(measurementType);

  const handleSave = async () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Error', 'Please enter a valid value');
      return;
    }

    await addMeasurement({
      date: date.toISOString(),
      type: measurementType,
      value: numValue,
      unit,
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Log ${measurementType}`,
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Value Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Value</Text>
            <View style={styles.valueInputContainer}>
              <TextInput
                style={styles.valueInput}
                value={value}
                onChangeText={setValue}
                placeholder="0"
                placeholderTextColor={StrongColors.textTertiary}
                keyboardType="decimal-pad"
                autoFocus
              />
              {unitOptions.length > 1 ? (
                <View style={styles.unitSelector}>
                  {unitOptions.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitOption,
                        unit === u && styles.unitOptionActive,
                      ]}
                      onPress={() => setUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitOptionText,
                          unit === u && styles.unitOptionTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.unitLabel}>{unit}</Text>
              )}
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={StrongColors.strongBlue} />
              <Text style={styles.dateButtonText}>
                {format(date, 'EEEE, MMMM d, yyyy')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
  saveButton: {
    ...Typography.body,
    color: StrongColors.strongBlue,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.lg,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...CommonStyles.inputLabel,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  valueInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: StrongColors.textPrimary,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  unitOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  unitOptionActive: {
    backgroundColor: StrongColors.strongBlue,
  },
  unitOptionText: {
    ...Typography.callout,
    color: StrongColors.textSecondary,
  },
  unitOptionTextActive: {
    color: StrongColors.textPrimary,
    fontWeight: '600',
  },
  unitLabel: {
    ...Typography.title2,
    color: StrongColors.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StrongColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  dateButtonText: {
    ...Typography.body,
    flex: 1,
  },
});
