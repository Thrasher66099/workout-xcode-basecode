import SwiftData
import Foundation

struct DataSeeder {
    static func seedExercises(modelContext: ModelContext) {
        // Check if we already have exercises to avoid duplicates
        let descriptor = FetchDescriptor<Exercise>()
        if let existingCount = try? modelContext.fetchCount(descriptor), existingCount > 0 {
            return
        }
        
        // List of default exercises
        let exercises = [
            // Chest
            Exercise(name: "Barbell Bench Press", type: "Barbell", bodyPart: "Chest"),
            Exercise(name: "Incline Bench Press", type: "Barbell", bodyPart: "Chest"),
            Exercise(name: "Dumbbell Bench Press", type: "Dumbbell", bodyPart: "Chest"),
            Exercise(name: "Incline Dumbbell Press", type: "Dumbbell", bodyPart: "Chest"),
            Exercise(name: "Chest Fly", type: "Machine", bodyPart: "Chest"),
            Exercise(name: "Push Up", type: "Bodyweight", bodyPart: "Chest"),
            
            // Back
            Exercise(name: "Deadlift", type: "Barbell", bodyPart: "Back"),
            Exercise(name: "Pull Up", type: "Bodyweight", bodyPart: "Back"),
            Exercise(name: "Lat Pulldown", type: "Cable", bodyPart: "Back"),
            Exercise(name: "Bent Over Row", type: "Barbell", bodyPart: "Back"),
            Exercise(name: "Seated Cable Row", type: "Cable", bodyPart: "Back"),
            Exercise(name: "Dumbbell Row", type: "Dumbbell", bodyPart: "Back"),
            
            // Legs
            Exercise(name: "Barbell Squat", type: "Barbell", bodyPart: "Legs"),
            Exercise(name: "Leg Press", type: "Machine", bodyPart: "Legs"),
            Exercise(name: "Bulgarian Split Squat", type: "Dumbbell", bodyPart: "Legs"),
            Exercise(name: "Romanian Deadlift", type: "Barbell", bodyPart: "Legs"),
            Exercise(name: "Leg Extension", type: "Machine", bodyPart: "Legs"),
            Exercise(name: "Leg Curl", type: "Machine", bodyPart: "Legs"),
            Exercise(name: "Calf Raise", type: "Machine", bodyPart: "Legs"),
            
            // Shoulders
            Exercise(name: "Overhead Press", type: "Barbell", bodyPart: "Shoulders"),
            Exercise(name: "Dumbbell Shoulder Press", type: "Dumbbell", bodyPart: "Shoulders"),
            Exercise(name: "Lateral Raise", type: "Dumbbell", bodyPart: "Shoulders"),
            Exercise(name: "Face Pull", type: "Cable", bodyPart: "Shoulders"),
            Exercise(name: "Arnold Press", type: "Dumbbell", bodyPart: "Shoulders"),
            
            // Arms
            Exercise(name: "Barbell Curl", type: "Barbell", bodyPart: "Biceps"),
            Exercise(name: "Hammer Curl", type: "Dumbbell", bodyPart: "Biceps"),
            Exercise(name: "Tricep Pushdown", type: "Cable", bodyPart: "Triceps"),
            Exercise(name: "Skullcrusher", type: "Barbell", bodyPart: "Triceps"),
            Exercise(name: "Dips", type: "Bodyweight", bodyPart: "Triceps"),
            
            // Core
            Exercise(name: "Plank", type: "Bodyweight", bodyPart: "Core"),
            Exercise(name: "Crunch", type: "Bodyweight", bodyPart: "Core"),
            Exercise(name: "Hanging Leg Raise", type: "Bodyweight", bodyPart: "Core"),
            
            // Plyometrics / Cardio
            Exercise(name: "Box Jump", type: "Plyometric", bodyPart: "Legs"),
            Exercise(name: "Burpee", type: "Plyometric", bodyPart: "Full Body"),
            Exercise(name: "Jump Rope", type: "Cardio", bodyPart: "Full Body"),
            Exercise(name: "Kettlebell Swing", type: "Kettlebell", bodyPart: "Full Body")
        ]
        
        for exercise in exercises {
            modelContext.insert(exercise)
        }
        
        do {
            try modelContext.save()
            print("Database seeded with exercises!")
        } catch {
            print("Failed to seed database: \(error)")
        }
    }
}
