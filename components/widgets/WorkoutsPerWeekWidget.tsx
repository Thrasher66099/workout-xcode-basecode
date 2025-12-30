import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, subWeeks, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

import { useData } from '@/contexts/DataContext';
import { StrongColors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export const WorkoutsPerWeekWidget: React.FC = () => {
  const { workouts, userProfile } = useData();
  const weeklyGoal = userProfile?.workoutsPerWeekGoal ?? 5;

  // Calculate workouts per week for the last 8 weeks
  const weeklyData = useMemo(() => {
    const weeks: { weekStart: Date; count: number }[] = [];
    const today = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });

      const count = workouts.filter((workout) => {
        const workoutDate = parseISO(workout.startTime);
        return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd });
      }).length;

      weeks.push({ weekStart, count });
    }

    return weeks;
  }, [workouts]);

  const maxCount = Math.max(...weeklyData.map((w) => w.count), weeklyGoal);
  const currentWeekCount = weeklyData[weeklyData.length - 1].count;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts Per Week</Text>
        <Text style={styles.currentCount}>
          {currentWeekCount} / {weeklyGoal}
        </Text>
      </View>

      <View style={styles.chartContainer}>
        {/* Goal line */}
        <View
          style={[
            styles.goalLine,
            { bottom: (weeklyGoal / maxCount) * 100 },
          ]}
        />

        {/* Bars */}
        <View style={styles.barsContainer}>
          {weeklyData.map((week, index) => {
            const isCurrentWeek = index === weeklyData.length - 1;
            const heightPercent = maxCount > 0 ? (week.count / maxCount) * 100 : 0;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: isCurrentWeek
                          ? StrongColors.strongBlue
                          : week.count >= weeklyGoal
                          ? StrongColors.strongGreen
                          : StrongColors.textTertiary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weekLabel}>
                  {format(week.weekStart, 'M/d')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: StrongColors.strongGreen }]} />
          <Text style={styles.legendText}>Goal met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: StrongColors.strongBlue }]} />
          <Text style={styles.legendText}>This week</Text>
        </View>
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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.headline,
  },
  currentCount: {
    ...Typography.headline,
    color: StrongColors.strongBlue,
  },
  chartContainer: {
    height: 120,
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: StrongColors.strongGreen,
    opacity: 0.5,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barBackground: {
    width: 20,
    height: 100,
    backgroundColor: StrongColors.inputBackground,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  weekLabel: {
    ...Typography.caption2,
    marginTop: Spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...Typography.caption1,
  },
});
