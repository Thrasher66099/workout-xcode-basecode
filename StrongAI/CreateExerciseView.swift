import SwiftUI
import SwiftData

struct CreateExerciseView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    
    @State private var name = ""
    @State private var bodyPart = "Chest"
    @State private var category = "Barbell"
    @State private var instructions = ""
    
    let bodyParts = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Other"]
    let categories = ["Barbell", "Dumbbell", "Machine", "Weighted Bodyweight", "Assisted Bodyweight", "Reps Only", "Cardio", "Duration", "Other"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Exercise Details")) {
                    TextField("Exercise Name", text: $name)
                    
                    Picker("Body Part", selection: $bodyPart) {
                        ForEach(bodyParts, id: \.self) { part in
                            Text(part).tag(part)
                        }
                    }
                    
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }
                }
                
                Section(header: Text("Instructions (Optional)")) {
                    TextEditor(text: $instructions)
                        .frame(height: 100)
                }
            }
            .navigationTitle("New Exercise")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveExercise()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
    
    func saveExercise() {
        let newExercise = Exercise(
            name: name,
            type: category,
            bodyPart: bodyPart,
            instructions: instructions
        )
        modelContext.insert(newExercise)
        dismiss()
    }
}
