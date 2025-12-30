import SwiftUI
import SwiftData
#if canImport(UIKit)
import UIKit
#endif

struct ContentView: View {
    @State private var selectedTab = 2 // Default to "Start Workout" (middle tab)
    
    var body: some View {
        TabView(selection: $selectedTab) {
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.circle")
                }
                .tag(0)
            
            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock.arrow.circlepath")
                }
                .tag(1)
            
            StartWorkoutView()
                .tabItem {
                    Label("Workout", systemImage: "plus.circle.fill")
                }
                .tag(2)
            
            ExercisesView()
                .tabItem {
                    Label("Exercises", systemImage: "dumbbell.fill")
                }
                .tag(3)
            
            Text("Measure")
                .tabItem {
                    Label("Measure", systemImage: "ruler.fill")
                }
                .tag(4)
        }
        .accentColor(.strongBlue)
        .onAppear {
            #if os(iOS)
            // Customize TabBar appearance if needed
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(Color.strongBlack)
            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
            #endif
        }
    }
}

// Placeholder for the main action tab
// Placeholder for the main action tab
struct StartWorkoutView: View {
    @Environment(\.modelContext) var modelContext
    @Query(sort: \Routine.name) private var routines: [Routine]
    @State private var showingCreateRoutine = false
    @State private var currentSession: WorkoutSession?
    @State private var selectedRoutine: Routine?
    @State private var routineToEdit: Routine?
    @State private var routineToDelete: Routine? // For delete confirmation
    @State private var showingDeleteAlert = false
    @State private var shareSheetItem: ShareItem? 
    
    struct ShareItem: Identifiable {
        let id = UUID()
        let text: String
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.strongBlack.ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text("StrongAI")
                            .font(.largeTitle)
                            .fontWeight(.heavy)
                            .foregroundColor(.white)
                            .padding(.horizontal)
                        
                        // "Start an Empty Workout" Button
                        Button(action: {
                            startEmptyWorkout()
                        }) {
                            HStack {
                                Image(systemName: "plus")
                                Text("Start an Empty Workout")
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.strongBlue)
                            .cornerRadius(10)
                        }
                        .padding(.horizontal)
                        .fullScreenCover(item: $currentSession) { session in
                            ActiveWorkoutView(session: session)
                        }

                        HStack {
                            Text("Your Routines")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button(action: { showingCreateRoutine = true }) {
                                Image(systemName: "plus.circle")
                                    .font(.title2)
                                    .foregroundColor(.strongBlue)
                            }
                        }
                        .padding(.horizontal)
                        
                        if routines.isEmpty {
                            Text("No routines created yet.")
                                .foregroundColor(.gray)
                                .padding(.horizontal)
                        } else {
                            ForEach(routines) { routine in
                                Button(action: {
                                    selectedRoutine = routine
                                }) {
                                    RoutineRow(routine: routine) { action in
                                        switch action {
                                        case .edit:
                                            routineToEdit = routine
                                        case .duplicate:
                                            duplicateRoutine(routine)
                                        case .share:
                                            shareSheetItem = ShareItem(text: generateShareText(for: routine))
                                        case .delete:
                                            routineToDelete = routine
                                            showingDeleteAlert = true
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                                .padding(.horizontal)
                            }
                        }
                    }
                    .padding(.top)
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingCreateRoutine) {
                CreateRoutineView()
            }
            .sheet(item: $selectedRoutine) { routine in
                RoutineDetailView(routine: routine) {
                    // On Start
                    selectedRoutine = nil
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        startRoutine(routine)
                    }
                }
            }
            .sheet(item: $routineToEdit) { routine in
                CreateRoutineView(routineToEdit: routine)
            }
            .alert("Delete Routine?", isPresented: $showingDeleteAlert, presenting: routineToDelete) { routine in
                Button("Delete", role: .destructive) {
                    deleteRoutine(routine)
                }
                Button("Cancel", role: .cancel) { }
            } message: { routine in
                Text("Are you sure you want to delete '\(routine.name)'? This action cannot be undone.")
            }
            .sheet(item: $shareSheetItem) { item in
                 ShareSheet(activityItems: [item.text])
            }
        }
    }
    
    // Logic needed for ShareSheet
    struct ShareSheet: UIViewControllerRepresentable {
        let activityItems: [Any]
        
        func makeUIViewController(context: Context) -> UIActivityViewController {
            UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
        }
        
        func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
    }
    
    func duplicateRoutine(_ routine: Routine) {
        let newRoutine = Routine(name: "\(routine.name) Copy", folder: routine.folder)
        modelContext.insert(newRoutine)
        
        // Deep copy contents
        for rExercise in routine.exercises {
            let newExercise = RoutineExercise(exerciseId: rExercise.exerciseId, name: rExercise.name)
            newRoutine.exercises.append(newExercise)
            
            for rSet in rExercise.sets {
                let newSet = RoutineSet(weight: rSet.weight, reps: rSet.reps, rpe: rSet.rpe)
                newExercise.sets.append(newSet)
            }
        }
    }
    
    func deleteRoutine(_ routine: Routine) {
        modelContext.delete(routine)
    }
    
    func generateShareText(for routine: Routine) -> String {
        var text = "Check out my workout: \(routine.name)\n\n"
        for exercise in routine.exercises {
            text += "• \(exercise.name): \(exercise.sets.count) sets\n"
        }
        return text
    }

    func startEmptyWorkout() {
        let newSession = WorkoutSession(startTime: Date())
        modelContext.insert(newSession)
        currentSession = newSession
    }
    
    func startRoutine(_ routine: Routine) {
        let newSession = WorkoutSession(startTime: Date())
        newSession.note = "Started from \(routine.name)"
        modelContext.insert(newSession)
        
        // Clone routine exercises/sets into live workout sets
        var setIndex = 1
        for exercise in routine.exercises {
            for rSet in exercise.sets {
                let newSet = WorkoutSet(
                    index: setIndex,
                    weight: rSet.weight,
                    reps: rSet.reps,
                    exerciseName: exercise.name,
                    exerciseId: exercise.exerciseId
                )
                // Default to Normal, maybe could store type in routine later
                newSession.sets.append(newSet)
                setIndex += 1
            }
        }
        
        currentSession = newSession
    }
}



struct ExercisesView: View {
    @Query(sort: \Exercise.name) private var exercises: [Exercise]
    @State private var searchText = ""
    @State private var selectedExercise: Exercise?
    @State private var showingCreateExercise = false
    
    var filteredExercises: [Exercise] {
        if searchText.isEmpty {
            return exercises
        } else {
            return exercises.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.strongBlack.ignoresSafeArea()
                
                List {
                    ForEach(filteredExercises) { exercise in
                        Button(action: { selectedExercise = exercise }) {
                            VStack(alignment: .leading) {
                                Text(exercise.name)
                                    .font(.headline)
                                    .foregroundColor(.white)
                                Text(exercise.bodyPart)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                        }
                        .listRowBackground(Color.strongDarkGrey)
                    }
                }
                .listStyle(.plain)
                .searchable(text: $searchText, placement: .navigationBarDrawer(displayMode: .always))
                .navigationTitle("Exercises")
                .toolbar {
                    ToolbarItem(placement: .primaryAction) {
                        Button(action: { showingCreateExercise = true }) {
                            Image(systemName: "plus")
                        }
                    }
                }
                .sheet(item: $selectedExercise) { exercise in
                    ExerciseDetailView(exercise: exercise)
                }
                .sheet(isPresented: $showingCreateExercise) {
                    CreateExerciseView()
                }
            }
        }
    }
}





#Preview {
    ContentView()
        .preferredColorScheme(.dark)
}
