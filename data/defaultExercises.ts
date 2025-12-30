// Default exercises matching the iOS app's DataSeeder.swift
// 34 pre-seeded exercises across all body parts

import { Exercise } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

// Helper to create exercise with consistent structure
const createExercise = (
  name: string,
  bodyPart: Exercise['bodyPart'],
  type: Exercise['type'],
  instructions: string
): Exercise => ({
  id: uuidv4(),
  name,
  bodyPart,
  type,
  instructions,
});

export const defaultExercises: Exercise[] = [
  // CHEST (6 exercises)
  createExercise(
    'Barbell Bench Press',
    'Chest',
    'Barbell',
    '1. Lie flat on bench with feet on floor\n2. Grip bar slightly wider than shoulders\n3. Lower bar to mid-chest\n4. Press bar up until arms are extended\n5. Keep back flat and core engaged'
  ),
  createExercise(
    'Incline Bench Press',
    'Chest',
    'Barbell',
    '1. Set bench to 30-45 degree angle\n2. Grip bar slightly wider than shoulders\n3. Lower bar to upper chest\n4. Press bar up until arms are extended\n5. Keep back against bench'
  ),
  createExercise(
    'Dumbbell Bench Press',
    'Chest',
    'Dumbbell',
    '1. Lie flat on bench with dumbbell in each hand\n2. Start with dumbbells at shoulder level\n3. Press dumbbells up until arms are extended\n4. Lower with control\n5. Keep elbows at 45-degree angle'
  ),
  createExercise(
    'Incline Dumbbell Press',
    'Chest',
    'Dumbbell',
    '1. Set bench to 30-45 degree incline\n2. Hold dumbbells at shoulder level\n3. Press up and slightly inward\n4. Lower with control to starting position\n5. Focus on upper chest contraction'
  ),
  createExercise(
    'Chest Fly',
    'Chest',
    'Dumbbell',
    '1. Lie flat on bench with dumbbells above chest\n2. Slight bend in elbows\n3. Lower arms out to sides in arc motion\n4. Feel stretch in chest\n5. Bring dumbbells back together above chest'
  ),
  createExercise(
    'Push Up',
    'Chest',
    'Reps Only',
    '1. Start in plank position, hands shoulder-width apart\n2. Keep body in straight line\n3. Lower chest to floor\n4. Push back up to starting position\n5. Keep core engaged throughout'
  ),

  // BACK (6 exercises)
  createExercise(
    'Deadlift',
    'Back',
    'Barbell',
    '1. Stand with feet hip-width apart, bar over mid-foot\n2. Bend at hips and knees to grip bar\n3. Keep back flat, chest up\n4. Drive through heels to stand up\n5. Lower bar with control by hinging at hips'
  ),
  createExercise(
    'Pull Up',
    'Back',
    'Reps Only',
    '1. Hang from bar with overhand grip\n2. Engage lats and pull chest toward bar\n3. Lead with chest, not chin\n4. Lower with control to full hang\n5. Keep core engaged throughout'
  ),
  createExercise(
    'Lat Pulldown',
    'Back',
    'Machine',
    '1. Sit at machine with thighs under pad\n2. Grip bar wider than shoulders\n3. Pull bar down to upper chest\n4. Squeeze shoulder blades together\n5. Control the return to start'
  ),
  createExercise(
    'Bent Over Row',
    'Back',
    'Barbell',
    '1. Hinge at hips with slight knee bend\n2. Grip bar slightly wider than shoulders\n3. Pull bar to lower chest/upper abs\n4. Squeeze shoulder blades at top\n5. Lower with control'
  ),
  createExercise(
    'Seated Cable Row',
    'Back',
    'Machine',
    '1. Sit with feet on platform, knees slightly bent\n2. Grip handle with arms extended\n3. Pull handle to lower chest\n4. Squeeze shoulder blades together\n5. Extend arms with control'
  ),
  createExercise(
    'Dumbbell Row',
    'Back',
    'Dumbbell',
    '1. Place one knee and hand on bench\n2. Hold dumbbell in opposite hand\n3. Pull dumbbell to hip\n4. Keep elbow close to body\n5. Lower with control'
  ),

  // LEGS (7 exercises)
  createExercise(
    'Barbell Squat',
    'Legs',
    'Barbell',
    '1. Bar on upper back, feet shoulder-width apart\n2. Brace core, chest up\n3. Sit back and down until thighs parallel\n4. Drive through heels to stand\n5. Keep knees tracking over toes'
  ),
  createExercise(
    'Leg Press',
    'Legs',
    'Machine',
    '1. Sit in machine with back flat against pad\n2. Feet shoulder-width on platform\n3. Lower weight by bending knees\n4. Press through heels to extend legs\n5. Don\'t lock knees at top'
  ),
  createExercise(
    'Bulgarian Split Squat',
    'Legs',
    'Dumbbell',
    '1. Rear foot elevated on bench\n2. Hold dumbbells at sides\n3. Lower until rear knee nearly touches floor\n4. Drive through front heel to stand\n5. Keep torso upright'
  ),
  createExercise(
    'Romanian Deadlift',
    'Legs',
    'Barbell',
    '1. Hold bar at hip level\n2. Slight bend in knees, hinge at hips\n3. Lower bar along legs to mid-shin\n4. Feel hamstring stretch\n5. Drive hips forward to stand'
  ),
  createExercise(
    'Leg Extension',
    'Legs',
    'Machine',
    '1. Sit in machine with back against pad\n2. Ankles behind lower pad\n3. Extend legs until straight\n4. Squeeze quads at top\n5. Lower with control'
  ),
  createExercise(
    'Leg Curl',
    'Legs',
    'Machine',
    '1. Lie face down on machine\n2. Ankles under pad\n3. Curl legs up toward glutes\n4. Squeeze hamstrings at top\n5. Lower with control'
  ),
  createExercise(
    'Calf Raise',
    'Legs',
    'Machine',
    '1. Stand on platform with balls of feet\n2. Heels hanging off edge\n3. Rise up onto toes\n4. Pause at top, squeeze calves\n5. Lower heels below platform level'
  ),

  // SHOULDERS (5 exercises)
  createExercise(
    'Overhead Press',
    'Shoulders',
    'Barbell',
    '1. Bar at shoulder height, grip just outside shoulders\n2. Brace core, squeeze glutes\n3. Press bar overhead until arms extended\n4. Lower bar to shoulders with control\n5. Keep bar path straight'
  ),
  createExercise(
    'Dumbbell Shoulder Press',
    'Shoulders',
    'Dumbbell',
    '1. Sit or stand with dumbbells at shoulders\n2. Palms facing forward\n3. Press dumbbells overhead\n4. Touch dumbbells at top\n5. Lower with control to shoulders'
  ),
  createExercise(
    'Lateral Raise',
    'Shoulders',
    'Dumbbell',
    '1. Stand with dumbbells at sides\n2. Slight bend in elbows\n3. Raise arms out to sides to shoulder height\n4. Lead with elbows\n5. Lower with control'
  ),
  createExercise(
    'Face Pull',
    'Shoulders',
    'Machine',
    '1. Cable at upper chest height, rope attachment\n2. Pull rope toward face\n3. Separate rope ends, pull to ears\n4. Squeeze rear delts and upper back\n5. Return with control'
  ),
  createExercise(
    'Arnold Press',
    'Shoulders',
    'Dumbbell',
    '1. Start with dumbbells at shoulders, palms facing you\n2. Press up while rotating palms forward\n3. Finish with palms facing away\n4. Reverse motion on the way down\n5. Keep movement controlled'
  ),

  // ARMS (5 exercises)
  createExercise(
    'Barbell Curl',
    'Arms',
    'Barbell',
    '1. Stand with bar at thighs, underhand grip\n2. Keep elbows at sides\n3. Curl bar to shoulders\n4. Squeeze biceps at top\n5. Lower with control'
  ),
  createExercise(
    'Hammer Curl',
    'Arms',
    'Dumbbell',
    '1. Stand with dumbbells at sides, palms facing in\n2. Keep elbows at sides\n3. Curl dumbbells to shoulders\n4. Maintain neutral grip throughout\n5. Lower with control'
  ),
  createExercise(
    'Tricep Pushdown',
    'Arms',
    'Machine',
    '1. Stand at cable machine, rope or bar attachment\n2. Grip attachment with elbows at sides\n3. Push down until arms are extended\n4. Squeeze triceps at bottom\n5. Return with control'
  ),
  createExercise(
    'Skullcrusher',
    'Arms',
    'Barbell',
    '1. Lie on bench with bar extended over chest\n2. Lower bar toward forehead by bending elbows\n3. Keep upper arms stationary\n4. Extend arms to starting position\n5. Control the movement'
  ),
  createExercise(
    'Dips',
    'Arms',
    'Reps Only',
    '1. Support yourself on parallel bars\n2. Lower body by bending elbows\n3. Lean slightly forward for chest focus\n4. Push up until arms extended\n5. Keep core engaged'
  ),

  // CORE (3 exercises)
  createExercise(
    'Plank',
    'Core',
    'Duration',
    '1. Forearms on ground, elbows under shoulders\n2. Body in straight line from head to heels\n3. Engage core, squeeze glutes\n4. Don\'t let hips sag or pike up\n5. Hold for prescribed time'
  ),
  createExercise(
    'Crunch',
    'Core',
    'Reps Only',
    '1. Lie on back, knees bent, feet flat\n2. Hands behind head or across chest\n3. Lift shoulders off ground\n4. Squeeze abs at top\n5. Lower with control'
  ),
  createExercise(
    'Hanging Leg Raise',
    'Core',
    'Reps Only',
    '1. Hang from pull-up bar\n2. Keep legs straight or slightly bent\n3. Raise legs until parallel to ground\n4. Lower with control\n5. Avoid swinging'
  ),

  // PLYOMETRICS & CARDIO (4 exercises)
  createExercise(
    'Box Jump',
    'Legs',
    'Reps Only',
    '1. Stand facing box\n2. Swing arms and jump onto box\n3. Land softly with both feet\n4. Stand up fully at top\n5. Step down and repeat'
  ),
  createExercise(
    'Burpee',
    'Cardio',
    'Reps Only',
    '1. Stand, then squat down\n2. Jump feet back to plank\n3. Perform push-up\n4. Jump feet forward to squat\n5. Jump up with arms overhead'
  ),
  createExercise(
    'Jump Rope',
    'Cardio',
    'Duration',
    '1. Hold rope handles at hip height\n2. Swing rope overhead\n3. Jump just high enough to clear rope\n4. Land softly on balls of feet\n5. Maintain steady rhythm'
  ),
  createExercise(
    'Kettlebell Swing',
    'Cardio',
    'Reps Only',
    '1. Stand with feet wider than shoulders\n2. Hinge at hips, grip kettlebell\n3. Drive hips forward explosively\n4. Swing kettlebell to chest height\n5. Control the swing back between legs'
  ),
];
