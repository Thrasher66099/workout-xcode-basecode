import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO, subDays } from 'date-fns';

import { useData } from '@/contexts/DataContext';
import { MeasurementType } from '@/types/models';
import { StrongColors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface MeasurementWidgetProps {
  measurementType: MeasurementType;
}

export const MeasurementWidget: React.FC<MeasurementWidgetProps> = ({
  measurementType,
}) => {
  const { getMeasurementsByType } = useData();

  const measurements = useMemo(() => {
    return getMeasurementsByType(measurementType).slice(0, 30);
  }, [measurementType]);

  if (measurements.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{measurementType}</Text>
        <Text style={styles.emptyText}>No measurements logged yet</Text>
      </View>
    );
  }

  const latest = measurements[0];
  const oldest = measurements[measurements.length - 1];
  const change = measurements.length > 1 ? latest.value - oldest.value : 0;

  // Calculate min/max for chart scaling
  const values = measurements.map((m) => m.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{measurementType}</Text>
        <View style={styles.currentValue}>
          <Text style={styles.valueText}>
            {latest.value} {latest.unit}
          </Text>
          {change !== 0 && (
            <Text
              style={[
                styles.changeText,
                { color: change > 0 ? StrongColors.strongGreen : StrongColors.strongRed },
              ]}
            >
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}
            </Text>
          )}
        </View>
      </View>

      {/* Simple line chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {measurements
            .slice()
            .reverse()
            .map((measurement, index) => {
              const heightPercent =
                ((measurement.value - minValue) / range) * 80 + 10;
              return (
                <View
                  key={measurement.id}
                  style={[
                    styles.chartDot,
                    {
                      bottom: `${heightPercent}%`,
                      left: `${(index / (measurements.length - 1 || 1)) * 100}%`,
                    },
                  ]}
                />
              );
            })}
        </View>
      </View>

      <View style={styles.dateRange}>
        <Text style={styles.dateText}>
          {format(parseISO(oldest.date), 'MMM d')}
        </Text>
        <Text style={styles.dateText}>
          {format(parseISO(latest.date), 'MMM d')}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headline,
  },
  currentValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    ...Typography.title3,
    color: StrongColors.strongBlue,
  },
  changeText: {
    ...Typography.caption1,
    marginTop: 2,
  },
  emptyText: {
    ...Typography.subheadline,
    textAlign: 'center',
    padding: Spacing.lg,
  },
  chartContainer: {
    height: 80,
    marginVertical: Spacing.sm,
  },
  chart: {
    flex: 1,
    position: 'relative',
    backgroundColor: StrongColors.inputBackground,
    borderRadius: BorderRadius.sm,
  },
  chartDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: StrongColors.strongBlue,
    marginLeft: -4,
    marginBottom: -4,
  },
  dateRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    ...Typography.caption2,
  },
});
