import SwiftUI
import SwiftData

struct WorkoutDetailView: View {
    @Bindable var session: WorkoutSession
    @State private var showingEditSheet = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Summary Header
                VStack(spacing: 16) {
                    Text(session.note ?? "Workout")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    HStack(spacing: 20) {
                        DetailStat(label: "Duration", value: session.durationString)
                        DetailStat(label: "Volume", value: "\(Int(calculateVolume())) kg")
                        DetailStat(label: "Sets", value: "\(session.sets.count)")
                    }
                }
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color.strongDarkGrey)
                .cornerRadius(12)
                .padding(.horizontal)
                
                // Exercises List
                VStack(spacing: 16) {
                    ForEach(uniqueExerciseIds(), id: \.self) { exerciseId in
                        if let firstSet = session.sets.first(where: { $0.exerciseId == exerciseId }) {
                            VStack(alignment: .leading, spacing: 12) {
                                Text(firstSet.exerciseName)
                                    .font(.headline)
                                    .foregroundColor(.strongBlue)
                                    .padding(.bottom, 4)
                                
                                let exerciseSets = session.sets.filter { $0.exerciseId == exerciseId }.sorted { $0.index < $1.index }
                                
                                ForEach(exerciseSets) { set in
                                    HStack {
                                        Text("Set \(set.index)")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                            .frame(width: 40, alignment: .leading)
                                        
                                        Spacer()
                                        
                                        Text("\(set.weight.formatted()) kg")
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .foregroundColor(.white)
                                        
                                        Text("×")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                        
                                        Text("\(set.reps) reps")
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                            .foregroundColor(.white)
                                        
                                        if let rpe = set.rpe {
                                            Text("@ \(rpe.formatted())")
                                                .font(.caption)
                                                .fontWeight(.bold)
                                                .foregroundColor(.strongBlue)
                                                .padding(.leading, 8)
                                        }
                                    }
                                    .padding(.vertical, 4)
                                    .padding(.horizontal, 8)
                                    .background(Color.black.opacity(0.2))
                                    .cornerRadius(6)
                                }
                            }
                            .padding()
                            .background(Color.strongDarkGrey)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color.strongBlack.ignoresSafeArea())
        .navigationTitle(session.startTime.formatted(date: .abbreviated, time: .shortened))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Edit") {
                    showingEditSheet = true
                }
            }
        }
        .fullScreenCover(isPresented: $showingEditSheet) {
            EditWorkoutView(session: session)
        }
    }
    
    func calculateVolume() -> Double {
        return session.sets.reduce(0) { total, set in
            if set.isCompleted {
                return total + (set.weight * Double(set.reps))
            }
            return total
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
}

struct DetailStat: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
                .foregroundColor(.white)
        }
    }
}
