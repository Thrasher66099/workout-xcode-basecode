import SwiftUI
import SwiftData

struct ExerciseDetailView: View {
    @Environment(\.dismiss) var dismiss
    let exercise: Exercise
    @State private var selectedTab = "About"
    
    // For History/Records
    @Query(sort: \WorkoutSession.startTime, order: .reverse) private var sessions: [WorkoutSession]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header is handled by NavigationBar
                
                // Custom Tab Bar
                Picker("Tabs", selection: $selectedTab) {
                    Text("About").tag("About")
                    Text("History").tag("History")
                    Text("Charts").tag("Charts")
                    Text("Records").tag("Records")
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()
                
                TabView(selection: $selectedTab) {
                    AboutTabView(exercise: exercise)
                        .tag("About")
                    
                    HistoryTabView(exerciseId: exercise.id, sessions: sessions)
                        .tag("History")
                    
                    ChartsTabView(exerciseName: exercise.name)
                        .tag("Charts")
                    
                    RecordsTabView(exerciseId: exercise.id, sessions: sessions)
                        .tag("Records")
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .navigationTitle(exercise.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                            .font(.title2)
                    }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button("Edit") {
                        // Placeholder for edit action
                    }
                }
            }
        }
    }
}

// MARK: - Sub Views

struct AboutTabView: View {
    let exercise: Exercise
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Image Placeholder
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.1))
                    .frame(height: 200)
                    .overlay(
                        VStack {
                            Image(systemName: "figure.strengthtraining.traditional")
                                .resizable()
                                .scaledToFit()
                                .frame(width: 80, height: 80)
                                .foregroundColor(.gray)
                            Text("Image Placeholder")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    )
                
                Text("Instructions")
                    .font(.headline)
                    .padding(.top)
                
                VStack(alignment: .leading, spacing: 12) {
                    InstructionStep(number: 1, text: "Approach the bar so it is positioned across the center of the foot.")
                    InstructionStep(number: 2, text: "Place feet shoulder width apart and grip the bar.")
                    InstructionStep(number: 3, text: "Lower hips and bend knees to bring shins to the bar.")
                    InstructionStep(number: 4, text: "Lift the chest and straighten the back.")
                    InstructionStep(number: 5, text: "Drive through the heels to lift the bar.")
                }
            }
            .padding()
        }
    }
}

struct InstructionStep: View {
    let number: Int
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(number).")
                .font(.headline)
                .foregroundColor(.gray)
            Text(text)
                .font(.body)
                .foregroundColor(.primary)
        }
    }
}

struct HistoryTabView: View {
    let exerciseId: UUID
    let sessions: [WorkoutSession]
    
    var historyItems: [HistoryItem] {
        var items: [HistoryItem] = []
        for session in sessions {
            let sets = session.sets.filter { $0.exerciseId == exerciseId }
            if !sets.isEmpty {
                items.append(HistoryItem(date: session.startTime, sets: sets))
            }
        }
        return items
    }
    
    struct HistoryItem: Identifiable {
        let id = UUID()
        let date: Date
        let sets: [WorkoutSet]
    }
    
    var body: some View {
        List {
            if historyItems.isEmpty {
                Text("No history for this exercise.")
                    .foregroundColor(.gray)
            } else {
                ForEach(historyItems) { item in
                    Section(header: Text(item.date.formatted(date: .abbreviated, time: .shortened))) {
                        ForEach(item.sets.sorted(by: { $0.index < $1.index })) { set in
                            HStack {
                                Text("\(set.index)")
                                    .frame(width: 30)
                                    .foregroundColor(.gray)
                                Spacer()
                                Text("\(Int(set.weight)) kg")
                                    .fontWeight(.bold)
                                Spacer()
                                Text("\(set.reps) reps")
                                if let rpe = set.rpe {
                                    Spacer()
                                    Text("RPE \(rpe, specifier: "%.1f")")
                                        .font(.caption)
                                        .foregroundColor(.strongBlue)
                                }
                            }
                        }
                    }
                }
            }
        }
        .listStyle(.grouped)
    }
}

struct ChartsTabView: View {
    let exerciseName: String
    
    var body: some View {
        VStack {
            ExerciseProgressView(exerciseName: exerciseName)
                .padding()
            Spacer()
        }
    }
}

struct RecordsTabView: View {
    let exerciseId: UUID
    let sessions: [WorkoutSession]
    
    var records: (maxWeight: Double, maxVolume: Double, estimated1RM: Double) {
        var maxWeight: Double = 0
        var maxVolume: Double = 0
        var est1RM: Double = 0
        
        for session in sessions {
            let sets = session.sets.filter { $0.exerciseId == exerciseId }
            
            // Max Weight
            if let maxSet = sets.max(by: { $0.weight < $1.weight }) {
                maxWeight = max(maxWeight, maxSet.weight)
                
                // Est 1RM (Epley formula: w * (1 + r/30))
                let oneRM = maxSet.weight * (1 + Double(maxSet.reps) / 30.0)
                est1RM = max(est1RM, oneRM)
            }
            
            // Max Volume (Session)
            let vol = sets.reduce(0) { $0 + ($1.weight * Double($1.reps)) }
            maxVolume = max(maxVolume, vol)
        }
        
        return (maxWeight, maxVolume, est1RM)
    }
    
    var body: some View {
        List {
            RecordRow(title: "One Rep Max (Est)", value: String(format: "%.1f kg", records.estimated1RM))
            RecordRow(title: "Max Weight", value: "\(Int(records.maxWeight)) kg")
            RecordRow(title: "Best Session Volume", value: "\(Int(records.maxVolume)) kg")
        }
    }
}

struct RecordRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .fontWeight(.bold)
                .foregroundColor(.strongBlue)
        }
    }
}
