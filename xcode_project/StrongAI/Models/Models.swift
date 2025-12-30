import Foundation
import SwiftData

// MARK: - Exercise
@Model
final class Exercise {
    @Attribute(.unique) var id: UUID
    var name: String
    var type: String // e.g., "Barbell", "Dumbbell"
    var bodyPart: String // e.g., "Chest", "Legs"
    var instructions: String
    
    // Relationship: One exercise can be in many logs (but SwiftData M2M is tricky, 
    // usually we just link logs to exercise ID or have a join table if needed. 
    // For simplicity, we'll keep it decoupled for now or link from Log side)
    
    init(name: String, type: String, bodyPart: String, instructions: String = "") {
        self.id = UUID()
        self.name = name
        self.type = type
        self.bodyPart = bodyPart
        self.instructions = instructions
    }
}

// MARK: - Workout Session (A completed or active workout)
@Model
final class WorkoutSession {
    @Attribute(.unique) var id: UUID
    var startTime: Date
    var endTime: Date?
    var note: String?
    
    @Relationship(deleteRule: .cascade, inverse: \WorkoutSet.session) var sets: [WorkoutSet] = []
    
    init(startTime: Date = Date()) {
        self.id = UUID()
        self.startTime = startTime
    }
}

// MARK: - Workout Set
@Model
final class WorkoutSet {
    @Attribute(.unique) var id: UUID
    var index: Int
    var weight: Double
    var reps: Int
    var rpe: Double? // Changed to Double for 0.5 increments
    var isCompleted: Bool
    var type: String // "Normal", "Warmup", "Drop", "Failure"
    
    // We link the set to a specific exercise name/ID for history tracking
    var exerciseName: String
    var exerciseId: UUID
    
    // Back-reference to session
    var session: WorkoutSession?
    
    init(index: Int, weight: Double, reps: Int, exerciseName: String, exerciseId: UUID, type: String = "Normal") {
        self.id = UUID()
        self.index = index
        self.weight = weight
        self.reps = reps
        self.isCompleted = false
        self.type = type
        self.exerciseName = exerciseName
        self.exerciseId = exerciseId
    }
}

// MARK: - Routine (Template)
@Model
final class Routine {
    @Attribute(.unique) var id: UUID
    var name: String
    var folder: String // e.g., "My Routines"
    
    @Relationship(deleteRule: .cascade) var exercises: [RoutineExercise] = []
    
    init(name: String, folder: String = "My Routines") {
        self.id = UUID()
        self.name = name
        self.folder = folder
    }
}

@Model
final class RoutineExercise {
    @Attribute(.unique) var id: UUID
    var exerciseId: UUID
    var name: String // Cached name
    
    @Relationship(deleteRule: .cascade) var sets: [RoutineSet] = []
    
    init(exerciseId: UUID, name: String) {
        self.id = UUID()
        self.exerciseId = exerciseId
        self.name = name
    }
}

@Model
final class RoutineSet {
    @Attribute(.unique) var id: UUID
    var weight: Double
    var reps: Int
    var rpe: Double?
    
    init(weight: Double, reps: Int, rpe: Double? = nil) {
        self.id = UUID()
        self.weight = weight
        self.reps = reps
        self.rpe = rpe
    }
}

// MARK: - Measurement Log
@Model
final class MeasurementLog {
    @Attribute(.unique) var id: UUID
    var date: Date
    var type: String // e.g., "Weight", "Body Fat", "Left Bicep"
    var value: Double
    var unit: String // e.g., "lb", "kg", "%", "in", "cm"
    
    init(date: Date = Date(), type: String, value: Double, unit: String) {
        self.id = UUID()
        self.date = date
        self.type = type
        self.value = value
        self.unit = unit
    }
}

// MARK: - Widget Configuration
@Model
final class WidgetConfiguration {
    @Attribute(.unique) var id: UUID
    var type: String // "workouts", "macros", "measurement", "exercise"
    
    // For Measurement Widgets
    var measurementType: String?
    
    // For Exercise Widgets
    var exerciseId: UUID?
    var exerciseMetric: String? // "Est. 1RM", "Max Weight", "Volume", "Best Set"
    
    var sortOrder: Int
    
    init(type: String, sortOrder: Int, measurementType: String? = nil, exerciseId: UUID? = nil, exerciseMetric: String? = nil) {
        self.id = UUID()
        self.type = type
        self.sortOrder = sortOrder
        self.measurementType = measurementType
        self.exerciseId = exerciseId
        self.exerciseMetric = exerciseMetric
    }
}

// MARK: - User Profile & Goals
@Model
final class UserProfile {
    @Attribute(.unique) var id: UUID
    var selectedGender: String // "Male", "Female"
    var birthday: Date // To calculate Age
    
    // Goals
    var goalType: String // "Lose", "Maintain", "Gain"
    // For Lose/Gain, how much per week? e.g. 0.5 lbs or 1.0 lbs
    // Positive value generally used. Logic handles negation for "Lose".
    var targetWeeklyRate: Double 
    
    // Activity Level for TDEE? 
    // For MVP we might default to "Moderate" or "Sedentary" if not asked, 
    // but calculating macros usually requires it. We'll add it.
    var activityLevel: String // "Sedentary", "Light", "Moderate", "Active", "Very Active"
    var workoutsPerWeekGoal: Int = 5
    
    init(gender: String = "Male", birthday: Date = Date(), goalType: String = "Maintain", targetWeeklyRate: Double = 0.0, activityLevel: String = "Moderate", workoutsPerWeekGoal: Int = 5) {
        self.id = UUID()
        self.selectedGender = gender
        self.birthday = birthday
        self.goalType = goalType
        self.targetWeeklyRate = targetWeeklyRate
        self.activityLevel = activityLevel
        self.workoutsPerWeekGoal = workoutsPerWeekGoal
    }
    
    // Helper to calculate macros
    // Returns (Calories, Protein, Fat, Carbs)
    func calculateDailyMacros(currentWeightLbs: Double, heightInches: Double) -> (calories: Int, protein: Int, fat: Int, carbs: Int) {
        // 1. Calculate BMR (Mifflin-St Jeor)
        let weightKg = currentWeightLbs * 0.453592
        let heightCm = heightInches * 2.54
        let ageComponents = Calendar.current.dateComponents([.year], from: birthday, to: Date())
        let age = Double(ageComponents.year ?? 25)
        
        var bmr: Double = 0
        if selectedGender == "Male" {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
        } else {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161
        }
        
        // 2. TDEE
        // Multipliers: Sedentary 1.2, Light 1.375, Moderate 1.55, Active 1.725, Very Active 1.9
        var multiplier: Double = 1.2
        switch activityLevel {
        case "Sedentary": multiplier = 1.2
        case "Light": multiplier = 1.375
        case "Moderate": multiplier = 1.55
        case "Active": multiplier = 1.725
        case "Very Active": multiplier = 1.9
        default: multiplier = 1.2
        }
        
        let tdee = bmr * multiplier
        
        // 3. Goal Adjustment
        // 1 lb of fat ~ 3500 calories. 1 lb/week = 500 kcal deficit/surplus per day
        let dailyAdjustment = targetWeeklyRate * 500
        
        var targetCalories = tdee
        if goalType == "Lose" {
            targetCalories -= dailyAdjustment
        } else if goalType == "Gain" {
            targetCalories += dailyAdjustment
        }
        
        // Ensure not too low/high bounds? (Optional safety)
        if targetCalories < 1200 { targetCalories = 1200 }
        
        // 4. Macros Split
        // Simple standard: Protein 1g/lb bodyweight? Or % split? 
        // Let's use % for now: 30P / 35C / 35F is a balanced start, or high protein.
        // User request didn't specify split preference.
        // Standard bodybuilder/fitness: 1g Protein per lb bodyweight. Rest split between fats/carbs.
        
        let proteinGrams = currentWeightLbs // 1g per lb
        let proteinCals = proteinGrams * 4
        
        var remainingCals = targetCalories - proteinCals
        // Safety check if protein takes up all cals
        if remainingCals < 0 { remainingCals = 0 }
        
        // Split remaining: 30% Fat, 70% Carbs? Or 50/50?
        // Let's go with 0.4g Fat per lb as minimum, then rest carbs.
        let fatGrams = currentWeightLbs * 0.4
        let fatCals = fatGrams * 9
        
        remainingCals -= fatCals
        
        let carbCals = max(0, remainingCals)
        let carbGrams = carbCals / 4
        
        return (
            calories: Int(targetCalories),
            protein: Int(proteinGrams),
            fat: Int(fatGrams),
            carbs: Int(carbGrams)
        )
    }
}
