import SwiftUI
import SwiftData

struct CreateRoutineView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    
    var routineToEdit: Routine?
    
    @State private var routineName = ""
    @State private var routineExercises: [RoutineExercise] = []
    @State private var showingAddExerciseSheet = false
    
    // Initializer to accept optional routine
    init(routineToEdit: Routine? = nil) {
        self.routineToEdit = routineToEdit
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Routine Details")) {
                    TextField("Routine Name", text: $routineName)
                }
                
                Section(header: Text("Exercises")) {
                    List {
                        ForEach(routineExercises) { exercise in
                            VStack(alignment: .leading) {
                                Text(exercise.name)
                                    .font(.headline)
                                
                                // Set Editor for this exercise
                                ForEach(exercise.sets) { set in
                                    HStack {
                                        Text("Set")
                                            .frame(width: 30)
                                        Spacer()
                                        TextField("kg", value: Binding(
                                            get: { set.weight },
                                            set: { set.weight = $0 }
                                        ), format: .number)
                                            .keyboardType(.decimalPad)
                                            .frame(width: 50)
                                            .background(Color.gray.opacity(0.1))
                                        Text("kg")
                                        
                                        Spacer()
                                        
                                        TextField("Reps", value: Binding(
                                            get: { set.reps },
                                            set: { set.reps = $0 }
                                        ), format: .number)
                                            .keyboardType(.numberPad)
                                            .frame(width: 50)
                                            .background(Color.gray.opacity(0.1))
                                        Text("reps")
                                    }
                                }
                                .onDelete { indexSet in
                                    exercise.sets.remove(atOffsets: indexSet)
                                }
                                
                                Button("Add Set") {
                                    withAnimation {
                                        let newSet = RoutineSet(weight: 0, reps: 0)
                                        if let last = exercise.sets.last {
                                            newSet.weight = last.weight
                                            newSet.reps = last.reps
                                        }
                                        exercise.sets.append(newSet)
                                    }
                                }
                                .buttonStyle(.borderless)
                                .font(.caption)
                                .foregroundColor(.strongBlue)
                                .padding(.top, 4)
                            }
                        }
                        .onDelete { indexSet in
                            routineExercises.remove(atOffsets: indexSet)
                        }
                    }
                    
                    Button(action: { showingAddExerciseSheet = true }) {
                        Label("Add Exercise", systemImage: "plus.circle.fill")
                            .foregroundColor(.strongBlue)
                    }
                }
            }
            .navigationTitle(routineToEdit == nil ? "New Routine" : "Edit Routine")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveRoutine()
                    }
                    .disabled(routineName.isEmpty || routineExercises.isEmpty)
                }
            }
            .sheet(isPresented: $showingAddExerciseSheet) {
                ExerciseSelectionView { exercise in
                    addExerciseToRoutine(exercise)
                }
            }
            .onAppear {
                if let routine = routineToEdit {
                    routineName = routine.name
                    // We need to create copies of the exercises so we don't modify the original live object until save
                    // Or we can modify directly? 
                    // Since it's SwiftData MainContext, modifying directly updates it.
                    // But we want "Cancel" to work.
                    // For typical SwiftData patterns with ViewModels, we'd copy.
                    // For this simple app, we can just load them.
                    // IMPORTANT: If we modify `routineExercises` array (add/remove), it won't affect `routine.exercises` until we save/assign back if they are disconnected.
                    // But `routine.exercises` is a Relationship array.
                    
                    // Strategy: Load local state. On Save, update the Routine object.
                    // Since we are using @State models that are technically connected to the context...
                    // Wait, `routineToEdit` is passed in. Its children are in context.
                    // If we edit them here, they might update live.
                    // To support "Cancel", we should ideally work on a scratchpad context or manual structs.
                    // Given complexity, let's just accept current limitations or try to deep copy for editing.
                    // Let's implement deep copy for editing state to allow clean Cancel.
                    
                    if routineExercises.isEmpty { // Only load once
                         routineExercises = routine.exercises.map { rExercise in
                             // Deep Copy RoutineExercise
                             let newRE = RoutineExercise(exerciseId: rExercise.exerciseId, name: rExercise.name)
                             newRE.sets = rExercise.sets.map { rSet in
                                 RoutineSet(weight: rSet.weight, reps: rSet.reps, rpe: rSet.rpe)
                             }
                             return newRE
                         }
                    }
                }
            }
        }
    }
    
    func addExerciseToRoutine(_ exercise: Exercise) {
        let newRoutineExercise = RoutineExercise(exerciseId: exercise.id, name: exercise.name)
        // Add default set
        newRoutineExercise.sets.append(RoutineSet(weight: 20, reps: 10))
        routineExercises.append(newRoutineExercise)
    }
    
    func saveRoutine() {
        if let existingRoutine = routineToEdit {
             // Update Existing
             existingRoutine.name = routineName
             
             // Replace exercises. 
             // Note: We need to be careful with relationships. 
             // Ideally delete old ones and insert new ones or diff them.
             // Simplest is replace all.
             existingRoutine.exercises = routineExercises // SwiftData should handle updating the relationship
             
             // We might need to ensure these new objects are inserted if they were created in memory
             // SwiftData usually handles this when assigned to a model in the context
        } else {
            // Create New
            let newRoutine = Routine(name: routineName)
            modelContext.insert(newRoutine)
            newRoutine.exercises = routineExercises
        }
        
        dismiss()
    }
}
