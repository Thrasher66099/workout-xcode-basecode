import SwiftUI
import SwiftData

struct ExerciseSelectionView: View {
    @Environment(\.dismiss) var dismiss
    @Query(sort: \Exercise.name) private var exercises: [Exercise]
    @State private var searchText = ""
    @State private var showingCreateExercise = false
    
    var onSelect: (Exercise) -> Void
    
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
                        Button(action: {
                            onSelect(exercise)
                            dismiss()
                        }) {
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
                .navigationTitle("Select Exercise")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") {
                            dismiss()
                        }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Button(action: { showingCreateExercise = true }) {
                            Image(systemName: "plus")
                        }
                    }
                }
                .sheet(isPresented: $showingCreateExercise) {
                    CreateExerciseView()
                }
            }
        }
    }
}
