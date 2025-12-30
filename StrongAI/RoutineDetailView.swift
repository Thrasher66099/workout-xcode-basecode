import SwiftUI

struct RoutineDetailView: View {
    @Environment(\.dismiss) var dismiss
    let routine: Routine
    var onStart: () -> Void
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.strongBlack.ignoresSafeArea()
                
                VStack(alignment: .leading, spacing: 20) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 24) {
                            ForEach(routine.exercises) { exercise in
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(exercise.name)
                                        .font(.headline)
                                        .foregroundColor(.white)
                                    
                                    Text("\(exercise.sets.count) sets")
                                        .font(.subheadline)
                                        .foregroundColor(.gray)
                                        
                                    // Optional: Show details of sets
                                    ForEach(Array(exercise.sets.enumerated()), id: \.offset) { index, set in
                                        HStack {
                                            Text("Set \(index + 1)")
                                                .frame(width: 50, alignment: .leading)
                                            Spacer()
                                            Text("\(Int(set.weight)) kg x \(set.reps)")
                                        }
                                        .font(.caption)
                                        .foregroundColor(.gray.opacity(0.8))
                                        .padding(.leading, 8)
                                    }
                                }
                                .padding()
                                .background(Color.strongDarkGrey)
                                .cornerRadius(10)
                            }
                        }
                        .padding()
                    }
                    
                    Button(action: {
                        onStart()
                    }) {
                        Text("Start Workout")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.strongBlue)
                            .cornerRadius(12)
                    }
                    .padding()
                }
            }
            .navigationTitle(routine.name)
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }
}
