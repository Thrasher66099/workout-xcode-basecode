import SwiftUI
import SwiftData

struct EditWorkoutView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    @Bindable var session: WorkoutSession
    @State private var showingAddExerciseSheet = false
    @StateObject private var timerManager = RestTimerManager() // Just to satisfy ExerciseCardView env requirement, though logic might be unused in edit mode
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.strongBlack.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        
                        // Exercises List
                        ForEach(uniqueExerciseIds(), id: \.self) { exerciseId in
                            if let set = session.sets.first(where: { $0.exerciseId == exerciseId }) {
                                ExerciseCardView(exerciseName: set.exerciseName, exerciseId: exerciseId, session: session)
                            }
                        }
                        .padding(.horizontal)
                        .environmentObject(timerManager)
                        
                        // Add Exercise Button
                        Button(action: {
                            showingAddExerciseSheet = true
                        }) {
                            HStack {
                                Image(systemName: "plus.circle.fill")
                                Text("Add Exercise")
                            }
                            .font(.headline)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.strongDarkGrey)
                            .foregroundColor(.strongBlue)
                            .cornerRadius(12)
                        }
                        .padding(.horizontal)
                        
                        Spacer()
                            .frame(height: 50)
                    }
                    .padding(.top)
                }
            }
            .navigationTitle("Edit Workout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        // In SwiftData, changes are often auto-saved in context.
                        // Assuming user wants to keep edits if they made them directly.
                        // If "Cancel" implies rollback, we'd need undo manager.
                        // For MVP, "Done" is effectively same as Close.
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        try? modelContext.save()
                        dismiss()
                    }
                    .fontWeight(.bold)
                }
            }
            .sheet(isPresented: $showingAddExerciseSheet) {
                ExerciseSelectionView { exercise in
                    addExercise(exercise)
                }
            }
        }
    }
    
    func uniqueExerciseIds() -> [UUID] {
        var seen = Set<UUID>()
        var unique: [UUID] = []
        for set in session.sets {
            if !seen.contains(set.exerciseId) {
                seen.insert(set.exerciseId)
                unique.append(set.exerciseId)
            }
        }
        return unique
    }
    
    func addExercise(_ exercise: Exercise) {
        withAnimation {
            let newSet = WorkoutSet(index: 1, weight: 0, reps: 0, exerciseName: exercise.name, exerciseId: exercise.id)
            session.sets.append(newSet)
        }
    }
}
