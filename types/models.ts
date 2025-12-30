// TypeScript models matching the Swift/SwiftData models from the Xcode project

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  bodyPart: BodyPart;
  instructions: string;
}

export type ExerciseType =
  | 'Barbell'
  | 'Dumbbell'
  | 'Machine'
  | 'Weighted Bodyweight'
  | 'Assisted Bodyweight'
  | 'Reps Only'
  | 'Cardio'
  | 'Duration'
  | 'Other';

export type BodyPart =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Arms'
  | 'Shoulders'
  | 'Core'
  | 'Cardio'
  | 'Other';

export type SetType = 'Normal' | 'Warmup' | 'Drop' | 'Failure';

export interface WorkoutSet {
  id: string;
  index: number;
  weight: number;
  reps: number;
  rpe?: number; // 6.0 - 10.0 in 0.5 increments
  isCompleted: boolean;
  type: SetType;
  exerciseName: string;
  exerciseId: string;
}

export interface WorkoutSession {
  id: string;
  startTime: string; // ISO date string
  endTime?: string; // ISO date string
  note?: string;
  sets: WorkoutSet[];
}

export interface RoutineSet {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: RoutineSet[];
}

export interface Routine {
  id: string;
  name: string;
  folder: string;
  exercises: RoutineExercise[];
}

export type MeasurementType =
  | 'Weight'
  | 'Body Fat'
  | 'Left Bicep'
  | 'Right Bicep'
  | 'Left Forearm'
  | 'Right Forearm'
  | 'Chest'
  | 'Waist'
  | 'Hips'
  | 'Left Thigh'
  | 'Right Thigh'
  | 'Left Calf'
  | 'Right Calf'
  | 'Neck'
  | 'Shoulders'
  | 'Left Wrist'
  | 'Right Wrist';

export type MeasurementUnit = 'lb' | 'kg' | '%' | 'in' | 'cm';

export interface MeasurementLog {
  id: string;
  date: string; // ISO date string
  type: MeasurementType;
  value: number;
  unit: MeasurementUnit;
}

export type WidgetType = 'workouts' | 'macros' | 'measurement' | 'exercise';

export type ExerciseMetric = 'Est. 1RM' | 'Max Weight' | 'Volume' | 'Best Set' | 'Max Reps';

export interface WidgetConfiguration {
  id: string;
  type: WidgetType;
  measurementType?: MeasurementType;
  exerciseId?: string;
  exerciseMetric?: ExerciseMetric;
  sortOrder: number;
}

export type Gender = 'Male' | 'Female';

export type GoalType = 'Lose' | 'Maintain' | 'Gain';

export type ActivityLevel =
  | 'Sedentary'
  | 'Light'
  | 'Moderate'
  | 'Active'
  | 'Very Active';

export interface UserProfile {
  id: string;
  selectedGender: Gender;
  birthday: string; // ISO date string
  goalType: GoalType;
  targetWeeklyRate: number; // lbs per week
  activityLevel: ActivityLevel;
  workoutsPerWeekGoal: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Helper function to calculate daily macros (matching Swift implementation)
export function calculateDailyMacros(
  profile: UserProfile,
  currentWeightLbs: number,
  heightInches: number
): MacroTargets {
  // Convert to metric
  const weightKg = currentWeightLbs * 0.453592;
  const heightCm = heightInches * 2.54;

  // Calculate age from birthday
  const birthday = new Date(profile.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }

  // Mifflin-St Jeor BMR Formula
  let bmr: number;
  if (profile.selectedGender === 'Male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Activity multiplier
  const activityMultipliers: Record<ActivityLevel, number> = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Active: 1.725,
    'Very Active': 1.9,
  };

  const tdee = bmr * activityMultipliers[profile.activityLevel];

  // Goal adjustment (500 cal per lb/week)
  let targetCalories = tdee;
  if (profile.goalType === 'Lose') {
    targetCalories -= profile.targetWeeklyRate * 500;
  } else if (profile.goalType === 'Gain') {
    targetCalories += profile.targetWeeklyRate * 500;
  }

  // Macro split: 1g protein/lb, 0.4g fat/lb, rest carbs
  const protein = Math.round(currentWeightLbs * 1.0);
  const fat = Math.round(currentWeightLbs * 0.4);
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = Math.max(0, targetCalories - proteinCals - fatCals);
  const carbs = Math.round(carbCals / 4);

  return {
    calories: Math.round(targetCalories),
    protein,
    carbs,
    fat,
  };
}

// Calculate estimated 1RM using Epley formula
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps === 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}
