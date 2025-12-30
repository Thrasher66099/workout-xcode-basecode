import SwiftUI
import SwiftData
import Combine
import Combine

enum RoutineAction {
    case edit
    case duplicate
    case share
    case delete
}

struct RoutineRow: View {
    let routine: Routine
    var onAction: (RoutineAction) -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(routine.name)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Text(routine.folder)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            Menu {
                Button(action: { onAction(.edit) }) {
                    Label("Edit Template", systemImage: "pencil")
                }
                
                Button(action: { onAction(.duplicate) }) {
                    Label("Duplicate", systemImage: "doc.on.doc")
                }
                
                Button(action: { onAction(.share) }) {
                     Label("Share", systemImage: "square.and.arrow.up")
                }
                
                Divider()
                
                Button(role: .destructive, action: { onAction(.delete) }) {
                    Label("Delete Template", systemImage: "trash")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .font(.title3)
                    .foregroundColor(.strongBlue)
                    .frame(width: 44, height: 44)
            }
        }
        .padding()
        .background(Color.strongDarkGrey)
        .cornerRadius(12)
    }
}

// MARK: - Active Workout Components

struct SetRowView: View {
    @Bindable var set: WorkoutSet
    let index: Int
    var onToggleType: () -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            // Set Number / Type Button
            Button(action: onToggleType) {
                Text(set.type == "Warmup" ? "W" : "\(index)")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(set.type == "Warmup" ? .orange : .black.opacity(0.7))
                    .frame(width: 30, height: 30)
                    .background(set.type == "Warmup" ? Color.orange.opacity(0.1) : Color.clear)
                    .cornerRadius(4)
            }
            .buttonStyle(.plain)
            
            Spacer()
            
            // Previous Data
            Text("No Previous")
                .font(.caption)
                .foregroundColor(.gray.opacity(0.5))
                .frame(maxWidth: .infinity)
            
            Spacer()
            
            // Weight Input
            TextField("0", value: $set.weight, format: .number)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.center)
                .frame(width: 50, height: 30)
                .background(Color.white.opacity(0.1))
                .cornerRadius(6)
                .foregroundColor(.white)
            
            Spacer()
            
            // Reps Input
            TextField("0", value: $set.reps, format: .number)
                .keyboardType(.numberPad)
                .multilineTextAlignment(.center)
                .frame(width: 50, height: 30) // Reduced width slightly
                .background(Color.white.opacity(0.1))
                .cornerRadius(6)
                .foregroundColor(.white)
            
            Spacer()
            
            // RPE Input
            Menu {
                Button("None") { set.rpe = nil }
                // 6.0 to 10.0 in 0.5 increments
                ForEach(Array(stride(from: 6.0, through: 10.0, by: 0.5)), id: \.self) { rating in
                    Button(String(format: "%g", rating)) { set.rpe = rating }
                }
            } label: {
                 Text(set.rpe.map { String(format: "%g", $0) } ?? "RPE")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(set.rpe == nil ? .gray : .strongBlue)
                    .frame(width: 40, height: 30)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(6)
            }
            .transaction { transaction in
                transaction.animation = nil // Disable animation for menu Presentation
            }
            
            Spacer()
            
            // Checkmark
            Button(action: {
                withAnimation(.spring(response: 0.3)) {
                    set.isCompleted.toggle()
                }
            }) {
                Image(systemName: "checkmark")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 30, height: 30)
                    .background(set.isCompleted ? Color.strongGreen : Color.white.opacity(0.1))
                    .cornerRadius(6)
            }
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 4)
        .background(set.isCompleted ? Color.strongGreen.opacity(0.2) : Color.clear)
    }
}

struct ExerciseCardView: View {
    let exerciseName: String
    let exerciseId: UUID
    @Bindable var session: WorkoutSession
    @State private var showingReplaceSheet = false
    @State private var restDuration: TimeInterval? = nil // Default: nil (off)
    @State private var showingRPEInfo = false
    @State private var showingDetail = false
    @EnvironmentObject var timerManager: RestTimerManager
    
    @Query private var exercises: [Exercise]
    
    init(exerciseName: String, exerciseId: UUID, session: WorkoutSession) {
        self.exerciseName = exerciseName
        self.exerciseId = exerciseId
        self.session = session
        
        let targetId = exerciseId
        _exercises = Query(filter: #Predicate { $0.id == targetId })
    }
    
    // Derived sets for this exercise
    var exerciseSets: [WorkoutSet] {
        session.sets.filter { $0.exerciseId == exerciseId }.sorted { $0.index < $1.index }
    }
    
    // Calculate volume for this exercise
    var volume: Double {
        exerciseSets.reduce(0) { total, set in
            if set.isCompleted {
                return total + (set.weight * Double(set.reps))
            }
            return total
        }
    }
    
    // Logic to calculate the "Visible Index" (Work Set Number)
    func visibleIndex(for targetSet: WorkoutSet) -> Int {
        var count = 0
        for set in exerciseSets {
            if set.type != "Warmup" {
                count += 1
            }
            if set.id == targetSet.id {
                return count
            }
        }
        return count
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: {
                    if !exercises.isEmpty {
                        showingDetail = true
                    }
                }) {
                    HStack(spacing: 4) {
                        Text(exerciseName)
                            .font(.headline)
                            .foregroundColor(Color.strongBlue)
                        
                        Image(systemName: "info.circle")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                .disabled(exercises.isEmpty)
                
                Spacer()
                
                // Volume Badge
                if volume > 0 {
                    Text("\(Int(volume)) kg")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.strongBlue)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.strongBlue.opacity(0.1))
                        .cornerRadius(12)
                }
                
                // Context Menu
                Menu {
                    Button(role: .destructive) {
                        deleteExercise()
                    } label: {
                        Label("Delete Exercise", systemImage: "trash")
                    }
                    
                    Button {
                        showingReplaceSheet = true
                    } label: {
                        Label("Replace Exercise", systemImage: "arrow.triangle.2.circlepath")
                    }
                    
                    Divider()
                    
                    // Rest Timer Configuration
                    // Rest Timer Configuration
                    Picker(selection: $restDuration) {
                        Text("Off").tag(TimeInterval?.none)
                        Text("30s").tag(TimeInterval?(30))
                        Text("60s").tag(TimeInterval?(60))
                        Text("90s").tag(TimeInterval?(90))
                        Text("2 min").tag(TimeInterval?(120))
                        Text("3 min").tag(TimeInterval?(180))
                    } label: {
                        Label("Rest Timer", systemImage: "timer")
                    }
                    
                    Divider()
                    
                    Button {
                        // Placeholder
                    } label: {
                        Label("Add Note", systemImage: "note.text")
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundColor(.gray)
                        .padding(.leading, 8)
                        .frame(width: 44, height: 44)
                }
            }
            .padding()
            .sheet(isPresented: $showingReplaceSheet) {
                ExerciseSelectionView { newExercise in
                    replaceExercise(with: newExercise)
                }
            }
            .sheet(isPresented: $showingRPEInfo) {
                VStack(spacing: 20) {
                    Text("What is RPE?")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("RPE stands for Rate of Perceived Exertion. It is a scale used to measure the intensity of your exercise.")
                        .multilineTextAlignment(.center)
                    
                    VStack(alignment: .leading, spacing: 10) {
                        Text("10: Maximum effort. No reps left.").bold()
                        Text("9.5: Could maybe do 1 more rep.")
                        Text("9: Could definitely do 1 more rep.")
                        Text("8.5: Could maybe do 2 more reps.")
                        Text("8: Could definitely do 2 more reps.")
                        Text("7: Quick bar speed, easy effort.")
                    }
                    .font(.body)
                    
                    Button("Got it") {
                        showingRPEInfo = false
                    }
                    .padding()
                    .background(Color.strongBlue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .padding()
                .presentationDetents([.medium])
            }
            
            // Column Headers
            HStack(spacing: 0) {
                Text("Set").frame(width: 30)
                Spacer()
                Text("Previous").frame(maxWidth: .infinity)
                Spacer()
                Text("Weight").frame(width: 50)
                Spacer()
                Text("Reps").frame(width: 50)
                Spacer()
                Button(action: { showingRPEInfo = true }) {
                    HStack(spacing: 2) {
                        Text("RPE")
                        Image(systemName: "info.circle")
                            .font(.system(size: 10))
                    }
                }
                .frame(width: 50)
                .foregroundColor(.strongBlue)
                
                Spacer()
                Image(systemName: "checkmark").frame(width: 30)
            }
            .font(.caption)
            .fontWeight(.bold)
            .foregroundColor(.gray)
            .padding(.horizontal, 4)
            .padding(.bottom, 8)
            
            // Sets
            ForEach(exerciseSets) { set in
                SetRowView(set: set, index: visibleIndex(for: set)) {
                    // Toggle Warmup Logic
                    withAnimation {
                        if set.type == "Warmup" {
                            set.type = "Normal"
                        } else {
                            set.type = "Warmup"
                        }
                    }
                }
                .onChange(of: set.isCompleted) { oldValue, newValue in
                     // Trigger Timer if marked complete and timer is configured
                     if newValue && !oldValue {
                         if let duration = restDuration {
                             timerManager.start(duration: duration)
                         }
                     }
                }
            }
            
            // Add Set Button
            Button(action: {
                withAnimation {
                    // Start as normal set
                    let newIndex = exerciseSets.count // Index field is internal sorting
                    let newSet = WorkoutSet(index: newIndex, weight: 0, reps: 0, exerciseName: exerciseName, exerciseId: exerciseId)
                    // If previous set was warmup, maybe default to warmup? For now default Normal.
                    
                    // Copy previous weight/reps if exists
                    if let last = exerciseSets.last {
                        newSet.weight = last.weight
                        newSet.reps = last.reps
                    }
                    
                    session.sets.append(newSet)
                }
            }) {
                Text("+ Add a Set")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(8)
            }
            .padding()
        }
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .cornerRadius(12)
        .sheet(isPresented: $showingDetail) {
            if let exercise = exercises.first {
                ExerciseDetailView(exercise: exercise)
            }
        }
    }

    
    func deleteExercise() {
        withAnimation {
            // Remove all sets for this exercise from session
            session.sets.removeAll { $0.exerciseId == exerciseId }
        }
    }
    
    func replaceExercise(with newExercise: Exercise) {
        withAnimation {
            // Update all sets to new exercise
            for set in exerciseSets {
                set.exerciseName = newExercise.name
                set.exerciseId = newExercise.id
            }
        }
    }
}

struct ActiveWorkoutView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    @Bindable var session: WorkoutSession
    @State private var workoutTime: TimeInterval = 0
    @State private var showingRecap = false
    @State private var showingAddExerciseSheet = false
    @StateObject private var timerManager = RestTimerManager()
    
    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    
    // Group exercises by ID to avoid duplicates in the list if we had multiple sets
    // But for this MVP, we will derive unique exercises from the sets


    // Formatting the duration
    var durationString: String {
        let hours = Int(workoutTime) / 3600
        let minutes = Int(workoutTime) / 60 % 60
        let seconds = Int(workoutTime) % 60
        return String(format: "%02i:%02i:%02i", hours, minutes, seconds)
    }
    
    var body: some View {
        ZStack { // ZStack for Overlay
            ScrollView {
                VStack(spacing: 20) {
                    // Top Bar
                    HStack {
                        ZStack {
                            // Timer in the corner (or leading)
                            HStack {
                                Label(durationString, systemImage: "timer")
                                    .font(.monospacedDigit(.headline)())
                                    .foregroundColor(.black)
                                    .padding(8)
                                    .background(Color.gray.opacity(0.2))
                                    .cornerRadius(8)
                                Spacer()
                            }
                            
                            // Finish Button
                            HStack {
                                Spacer()
                                Button("Finish") {
                                    finishWorkout()
                                }
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(Color.strongBlue)
                                .cornerRadius(8)
                            }
                        }
                    }
                    .padding(.top)
                    .padding(.horizontal)
                    
                    // Session Meta
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Current Session")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.black)
                        
                        Text("\(session.startTime.formatted(date: .abbreviated, time: .omitted))")
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)
                    
                    // Exercises List
                    
                    ForEach(uniqueExerciseIds(), id: \.self) { exerciseId in
                        if let set = session.sets.first(where: { $0.exerciseId == exerciseId }) {
                            ExerciseCardView(exerciseName: set.exerciseName, exerciseId: exerciseId, session: session)
                        }
                    }
                    .padding(.horizontal)
                    .environmentObject(timerManager) // Inject manager to children cards
                    
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
                        .background(Color.white)
                        .foregroundColor(.strongBlue)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    
                    Spacer()
                        .frame(height: 100) // Space for overlay
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
            .onReceive(timer) { _ in
                workoutTime += 1
            }
            .fullScreenCover(isPresented: $showingRecap) {
                RecapView(session: session) {
                    // On Dismiss of Recap
                    showingRecap = false
                    dismiss() // Dismiss ActiveWorkoutView
                }
            }
            .sheet(isPresented: $showingAddExerciseSheet) {
                ExerciseSelectionView { exercise in
                    addExercise(exercise)
                }
            }
            
            // Rest Timer Overlay
            if timerManager.isRunning {
                VStack {
                    Spacer()
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Rest Timer")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text(timerManager.timeString)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .monospacedDigit()
                        }
                        
                        Spacer()
                        
                        Button(action: { timerManager.add(seconds: 30) }) {
                            Text("+30s")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.white.opacity(0.2))
                                .cornerRadius(8)
                        }
                        
                        Button(action: { timerManager.stop() }) {
                            Image(systemName: "xmark")
                                .font(.headline)
                                .foregroundColor(.white)
                                .padding(10)
                                .background(Color.white.opacity(0.2))
                                .clipShape(Circle())
                        }
                    }
                    .padding()
                    .background(Color.strongBlack)
                    .cornerRadius(16)
                    .padding()
                    .shadow(radius: 10)
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
                .animation(.spring(), value: timerManager.isRunning)
            }
        }
    }
    
    func uniqueExerciseIds() -> [UUID] {
        // Order matters, maintain insertion order
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
            // Add first set for the new exercise
            // Find next index for session? No, sets are ordered per exercise usually.
            // But we need to maintain global order if we want them to stay at the bottom.
            // For now just appending is fine.
            let newSet = WorkoutSet(index: 1, weight: 0, reps: 0, exerciseName: exercise.name, exerciseId: exercise.id)
            session.sets.append(newSet)
        }
    }
    
    func finishWorkout() {
        session.endTime = Date()
        timerManager.stop() // Stop any running timers
        // Save Context
        try? modelContext.save()
        showingRecap = true
    }
}


#Preview {
    do {
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        let container = try ModelContainer(for: Schema([Exercise.self, WorkoutSession.self, WorkoutSet.self, Routine.self]), configurations: config)
        let session = WorkoutSession(startTime: Date())
        container.mainContext.insert(session)
        
        return ActiveWorkoutView(session: session)
            .modelContainer(container)
    } catch {
        return Text("Failed to create preview: \(error.localizedDescription)")
    }
}
