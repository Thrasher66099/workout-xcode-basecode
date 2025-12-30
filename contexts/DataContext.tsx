import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import {
  Exercise,
  WorkoutSession,
  WorkoutSet,
  Routine,
  RoutineExercise,
  RoutineSet,
  MeasurementLog,
  WidgetConfiguration,
  UserProfile,
  SetType,
} from '../types/models';
import { defaultExercises } from '../data/defaultExercises';

// Storage keys
const STORAGE_KEYS = {
  EXERCISES: '@strongai_exercises',
  WORKOUTS: '@strongai_workouts',
  ROUTINES: '@strongai_routines',
  MEASUREMENTS: '@strongai_measurements',
  WIDGETS: '@strongai_widgets',
  USER_PROFILE: '@strongai_user_profile',
  SEEDED: '@strongai_seeded',
};

// Active workout state
interface ActiveWorkout {
  session: WorkoutSession;
  currentExerciseId: string | null;
}

interface DataContextType {
  // Data
  exercises: Exercise[];
  workouts: WorkoutSession[];
  routines: Routine[];
  measurements: MeasurementLog[];
  widgets: WidgetConfiguration[];
  userProfile: UserProfile | null;
  activeWorkout: ActiveWorkout | null;
  isLoading: boolean;

  // Exercise actions
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  updateExercise: (exercise: Exercise) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  getExerciseById: (id: string) => Exercise | undefined;

  // Workout actions
  startWorkout: (fromRoutine?: Routine) => void;
  endWorkout: (note?: string) => Promise<WorkoutSession | null>;
  cancelWorkout: () => void;
  addSetToWorkout: (exerciseId: string, set: Omit<WorkoutSet, 'id' | 'exerciseId' | 'exerciseName'>) => void;
  updateSetInWorkout: (setId: string, updates: Partial<WorkoutSet>) => void;
  deleteSetFromWorkout: (setId: string) => void;
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  deleteWorkout: (id: string) => Promise<void>;
  updateWorkout: (workout: WorkoutSession) => Promise<void>;

  // Routine actions
  addRoutine: (routine: Omit<Routine, 'id'>) => Promise<Routine>;
  updateRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  duplicateRoutine: (id: string) => Promise<Routine | null>;

  // Measurement actions
  addMeasurement: (measurement: Omit<MeasurementLog, 'id'>) => Promise<MeasurementLog>;
  deleteMeasurement: (id: string) => Promise<void>;
  getMeasurementsByType: (type: MeasurementLog['type']) => MeasurementLog[];

  // Widget actions
  addWidget: (widget: Omit<WidgetConfiguration, 'id'>) => Promise<WidgetConfiguration>;
  removeWidget: (id: string) => Promise<void>;
  reorderWidgets: (widgets: WidgetConfiguration[]) => Promise<void>;

  // User profile actions
  updateUserProfile: (profile: UserProfile) => Promise<void>;

  // Utility
  getWorkoutHistory: (exerciseId: string) => WorkoutSet[];
  getExerciseRecords: (exerciseId: string) => { maxWeight: number; max1RM: number; maxVolume: number; maxReps: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementLog[]>([]);
  const [widgets, setWidgets] = useState<WidgetConfiguration[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Check if data has been seeded
      const seeded = await AsyncStorage.getItem(STORAGE_KEYS.SEEDED);

      // Load all data in parallel
      const [
        exercisesData,
        workoutsData,
        routinesData,
        measurementsData,
        widgetsData,
        profileData,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXERCISES),
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEYS.ROUTINES),
        AsyncStorage.getItem(STORAGE_KEYS.MEASUREMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.WIDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      ]);

      // If not seeded, add default exercises
      if (!seeded) {
        await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(defaultExercises));
        await AsyncStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
        setExercises(defaultExercises);
      } else {
        setExercises(exercisesData ? JSON.parse(exercisesData) : []);
      }

      setWorkouts(workoutsData ? JSON.parse(workoutsData) : []);
      setRoutines(routinesData ? JSON.parse(routinesData) : []);
      setMeasurements(measurementsData ? JSON.parse(measurementsData) : []);
      setWidgets(widgetsData ? JSON.parse(widgetsData) : []);
      setUserProfile(profileData ? JSON.parse(profileData) : null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save helpers
  const saveExercises = async (data: Exercise[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(data));
    setExercises(data);
  };

  const saveWorkouts = async (data: WorkoutSession[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(data));
    setWorkouts(data);
  };

  const saveRoutines = async (data: Routine[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(data));
    setRoutines(data);
  };

  const saveMeasurements = async (data: MeasurementLog[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(data));
    setMeasurements(data);
  };

  const saveWidgets = async (data: WidgetConfiguration[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(data));
    setWidgets(data);
  };

  const saveUserProfile = async (data: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data));
    setUserProfile(data);
  };

  // Exercise actions
  const addExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const newExercise: Exercise = { ...exercise, id: uuidv4() };
    await saveExercises([...exercises, newExercise]);
    return newExercise;
  };

  const updateExercise = async (exercise: Exercise) => {
    const updated = exercises.map((e) => (e.id === exercise.id ? exercise : e));
    await saveExercises(updated);
  };

  const deleteExercise = async (id: string) => {
    const filtered = exercises.filter((e) => e.id !== id);
    await saveExercises(filtered);
  };

  const getExerciseById = (id: string) => exercises.find((e) => e.id === id);

  // Workout actions
  const startWorkout = useCallback((fromRoutine?: Routine) => {
    const session: WorkoutSession = {
      id: uuidv4(),
      startTime: new Date().toISOString(),
      sets: [],
    };

    // If starting from routine, pre-populate sets
    if (fromRoutine) {
      let setIndex = 0;
      fromRoutine.exercises.forEach((routineExercise) => {
        routineExercise.sets.forEach((routineSet) => {
          session.sets.push({
            id: uuidv4(),
            index: setIndex++,
            weight: routineSet.weight,
            reps: routineSet.reps,
            rpe: routineSet.rpe,
            isCompleted: false,
            type: 'Normal',
            exerciseName: routineExercise.name,
            exerciseId: routineExercise.exerciseId,
          });
        });
      });
    }

    setActiveWorkout({
      session,
      currentExerciseId: null,
    });
  }, []);

  const endWorkout = async (note?: string): Promise<WorkoutSession | null> => {
    if (!activeWorkout) return null;

    const completedSession: WorkoutSession = {
      ...activeWorkout.session,
      endTime: new Date().toISOString(),
      note,
      sets: activeWorkout.session.sets.filter((s) => s.isCompleted),
    };

    await saveWorkouts([completedSession, ...workouts]);
    setActiveWorkout(null);
    return completedSession;
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
  };

  const addSetToWorkout = (
    exerciseId: string,
    set: Omit<WorkoutSet, 'id' | 'exerciseId' | 'exerciseName'>
  ) => {
    if (!activeWorkout) return;

    const exercise = getExerciseById(exerciseId);
    if (!exercise) return;

    const newSet: WorkoutSet = {
      ...set,
      id: uuidv4(),
      exerciseId,
      exerciseName: exercise.name,
    };

    setActiveWorkout({
      ...activeWorkout,
      session: {
        ...activeWorkout.session,
        sets: [...activeWorkout.session.sets, newSet],
      },
    });
  };

  const updateSetInWorkout = (setId: string, updates: Partial<WorkoutSet>) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      session: {
        ...activeWorkout.session,
        sets: activeWorkout.session.sets.map((s) =>
          s.id === setId ? { ...s, ...updates } : s
        ),
      },
    });
  };

  const deleteSetFromWorkout = (setId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      session: {
        ...activeWorkout.session,
        sets: activeWorkout.session.sets.filter((s) => s.id !== setId),
      },
    });
  };

  const addExerciseToWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;

    const exercise = getExerciseById(exerciseId);
    if (!exercise) return;

    // Add a default set for the new exercise
    const newSet: WorkoutSet = {
      id: uuidv4(),
      index: activeWorkout.session.sets.length,
      weight: 0,
      reps: 0,
      isCompleted: false,
      type: 'Normal',
      exerciseName: exercise.name,
      exerciseId,
    };

    setActiveWorkout({
      ...activeWorkout,
      session: {
        ...activeWorkout.session,
        sets: [...activeWorkout.session.sets, newSet],
      },
      currentExerciseId: exerciseId,
    });
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      session: {
        ...activeWorkout.session,
        sets: activeWorkout.session.sets.filter((s) => s.exerciseId !== exerciseId),
      },
    });
  };

  const deleteWorkout = async (id: string) => {
    const filtered = workouts.filter((w) => w.id !== id);
    await saveWorkouts(filtered);
  };

  const updateWorkout = async (workout: WorkoutSession) => {
    const updated = workouts.map((w) => (w.id === workout.id ? workout : w));
    await saveWorkouts(updated);
  };

  // Routine actions
  const addRoutine = async (routine: Omit<Routine, 'id'>): Promise<Routine> => {
    const newRoutine: Routine = { ...routine, id: uuidv4() };
    await saveRoutines([...routines, newRoutine]);
    return newRoutine;
  };

  const updateRoutine = async (routine: Routine) => {
    const updated = routines.map((r) => (r.id === routine.id ? routine : r));
    await saveRoutines(updated);
  };

  const deleteRoutine = async (id: string) => {
    const filtered = routines.filter((r) => r.id !== id);
    await saveRoutines(filtered);
  };

  const duplicateRoutine = async (id: string): Promise<Routine | null> => {
    const routine = routines.find((r) => r.id === id);
    if (!routine) return null;

    const duplicated: Routine = {
      ...routine,
      id: uuidv4(),
      name: `${routine.name} (Copy)`,
      exercises: routine.exercises.map((e) => ({
        ...e,
        id: uuidv4(),
        sets: e.sets.map((s) => ({ ...s, id: uuidv4() })),
      })),
    };

    await saveRoutines([...routines, duplicated]);
    return duplicated;
  };

  // Measurement actions
  const addMeasurement = async (measurement: Omit<MeasurementLog, 'id'>): Promise<MeasurementLog> => {
    const newMeasurement: MeasurementLog = { ...measurement, id: uuidv4() };
    await saveMeasurements([newMeasurement, ...measurements]);
    return newMeasurement;
  };

  const deleteMeasurement = async (id: string) => {
    const filtered = measurements.filter((m) => m.id !== id);
    await saveMeasurements(filtered);
  };

  const getMeasurementsByType = (type: MeasurementLog['type']) => {
    return measurements
      .filter((m) => m.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Widget actions
  const addWidget = async (widget: Omit<WidgetConfiguration, 'id'>): Promise<WidgetConfiguration> => {
    const newWidget: WidgetConfiguration = {
      ...widget,
      id: uuidv4(),
      sortOrder: widgets.length,
    };
    await saveWidgets([...widgets, newWidget]);
    return newWidget;
  };

  const removeWidget = async (id: string) => {
    const filtered = widgets.filter((w) => w.id !== id);
    await saveWidgets(filtered);
  };

  const reorderWidgets = async (reorderedWidgets: WidgetConfiguration[]) => {
    await saveWidgets(reorderedWidgets);
  };

  // User profile actions
  const updateUserProfile = async (profile: UserProfile) => {
    await saveUserProfile(profile);
  };

  // Utility functions
  const getWorkoutHistory = (exerciseId: string): WorkoutSet[] => {
    return workouts
      .flatMap((w) => w.sets)
      .filter((s) => s.exerciseId === exerciseId && s.isCompleted)
      .sort((a, b) => b.index - a.index);
  };

  const getExerciseRecords = (exerciseId: string) => {
    const sets = getWorkoutHistory(exerciseId);

    if (sets.length === 0) {
      return { maxWeight: 0, max1RM: 0, maxVolume: 0, maxReps: 0 };
    }

    let maxWeight = 0;
    let max1RM = 0;
    let maxVolume = 0;
    let maxReps = 0;

    sets.forEach((set) => {
      if (set.weight > maxWeight) maxWeight = set.weight;
      if (set.reps > maxReps) maxReps = set.reps;

      // Epley formula for 1RM
      const estimated1RM = set.reps === 1 ? set.weight : set.weight * (1 + set.reps / 30);
      if (estimated1RM > max1RM) max1RM = estimated1RM;

      const volume = set.weight * set.reps;
      if (volume > maxVolume) maxVolume = volume;
    });

    return {
      maxWeight: Math.round(maxWeight * 10) / 10,
      max1RM: Math.round(max1RM * 10) / 10,
      maxVolume: Math.round(maxVolume),
      maxReps,
    };
  };

  const value: DataContextType = {
    exercises,
    workouts,
    routines,
    measurements,
    widgets,
    userProfile,
    activeWorkout,
    isLoading,
    addExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    startWorkout,
    endWorkout,
    cancelWorkout,
    addSetToWorkout,
    updateSetInWorkout,
    deleteSetFromWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    deleteWorkout,
    updateWorkout,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    addMeasurement,
    deleteMeasurement,
    getMeasurementsByType,
    addWidget,
    removeWidget,
    reorderWidgets,
    updateUserProfile,
    getWorkoutHistory,
    getExerciseRecords,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
