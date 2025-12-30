import SwiftUI
import SwiftData

struct AddWidgetView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    
    // We no longer bind directly to activeWidgets array, instead we insert WidgetConfig objects
    
    enum Category: String, CaseIterable, Identifiable {
        case workout = "Workout & Nutrition"
        case exercises = "Exercises"
        case measurements = "Measurements"
        
        var id: String { self.rawValue }
    }
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Workout & Nutrition")) {
                    Button(action: { addWidget(type: "workouts") }) {
                        WidgetRow(title: "Workouts Per Week", subtitle: "Display workout consistency")
                    }
                    Button(action: { addWidget(type: "calories") }) {
                        WidgetRow(title: "Calories This Week", subtitle: "Weekly overview of caloric intake")
                    }
                    Button(action: { addWidget(type: "macros") }) {
                        WidgetRow(title: "Daily Macros", subtitle: "Daily overview of macro intake")
                    }
                }
                
                Section(header: Text("Advanced")) {
                    NavigationLink(destination: ExerciseSelectionList()) {
                        WidgetRow(title: "Exercises", subtitle: "Track a specific exercise")
                    }
                    
                    NavigationLink(destination: MeasurementSelectionList(onAdd: { type in
                        addWidget(type: "measurement", measurementType: type)
                    })) {
                        WidgetRow(title: "Measurements", subtitle: "Track a specific body metric")
                    }
                }
            }
            .navigationTitle("Add Widget")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                            .font(.title2)
                    }
                }
            }
        }
    }
    
    func addWidget(type: String, measurementType: String? = nil) {
        let config = WidgetConfiguration(type: type, sortOrder: 0, measurementType: measurementType)
        modelContext.insert(config)
        try? modelContext.save()
        dismiss()
    }
}

struct WidgetRow: View {
    let title: String
    let subtitle: String
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
                .foregroundColor(.black)
            Text(subtitle)
                .font(.subheadline)
                .foregroundColor(.gray)
        }
        .padding(.vertical, 4)
    }
}

struct MeasurementSelectionList: View {
    @Environment(\.dismiss) var dismiss
    var onAdd: (String) -> Void
    
    let measurements = [
        "Weight", "Body Fat", "Caloric Intake", "Neck", "Shoulders", "Chest",
        "Left Bicep", "Right Bicep", "Left Forearm", "Right Forearm",
        "Upper Abs", "Waist", "Lower Abs", "Hips", "Left Thigh", "Right Thigh", "Left Calf"
    ]
    
    var body: some View {
        List {
            ForEach(measurements, id: \.self) { type in
                Button(action: {
                    onAdd(type)
                    // We dismiss up the stack or handled by parent dismissal
                }) {
                    Text(type)
                        .foregroundColor(.black)
                }
            }
        }
        .navigationTitle("Measurements")
    }
}

// Reuse ExerciseSelectionView or create a specialized one?
// Let's create a wrapper that pushes to Metric Selection
struct ExerciseSelectionList: View {
    // Removed unused callback
    
    // We can reuse the existing `ExerciseSelectionView` via a wrapper if it wasn't a sheet content itself.
    // However `ExerciseSelectionView` has its own NavigationView which might conflict.
    // Let's verify ExerciseSelectionView code.
    // It wraps content in NavigationView. So we cannot push it onto this stack.
    // We need a simplified list for navigation stack usage.
    
    @Query(sort: \Exercise.name) private var exercises: [Exercise]
    @State private var searchText = ""
    
    var filteredExercises: [Exercise] {
        if searchText.isEmpty {
            return exercises
        } else {
            return exercises.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
    }
    
    var body: some View {
        List {
            ForEach(filteredExercises) { exercise in
                NavigationLink(destination: MetricSelectionView(exercise: exercise)) {
                    Text(exercise.name)
                }
            }
        }
        .searchable(text: $searchText)
        .navigationTitle("Exercises")
    }
}

struct MetricSelectionView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    let exercise: Exercise
    
    // We need to dismiss the whole sheet when done. 
    // The easiest way is to use a binding or notification, but for quick implementation we can rely on AddWidgetView's parent.
    // Actually we need to call insertion here.
    
    let metrics = ["Best Set (Est. 1RM)", "Best Set (Max Weight)", "Total Volume", "PR Progression (as 1RM)", "Max Consecutive Reps"]
    
    var body: some View {
        List {
            ForEach(metrics, id: \.self) { metric in
                Button(action: {
                    addWidget(metric: metric)
                }) {
                    Text(metric)
                        .foregroundColor(.black)
                        .fontWeight(.medium)
                }
            }
        }
        .navigationTitle(exercise.name)
    }
    
    func addWidget(metric: String) {
        let config = WidgetConfiguration(
            type: "exercise",
            sortOrder: 0,
            exerciseId: exercise.id,
            exerciseMetric: metric
        )
        modelContext.insert(config)
        try? modelContext.save()
        // Dismiss all
        NotificationCenter.default.post(name: NSNotification.Name("CloseAddWidgetSheet"), object: nil)
    }
}
