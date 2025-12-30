import SwiftUI
import SwiftData

@main
struct StrongAIApp: App {
    let container: ModelContainer
    
    init() {
        do {
            let schema = Schema([
                Exercise.self,
                WorkoutSession.self,
                WorkoutSet.self,
                Routine.self,
                WidgetConfiguration.self,
                MeasurementLog.self,
                UserProfile.self
            ])
            container = try ModelContainer(for: schema)
            
            let modelContainer = container
            // Seed Data
            Task { @MainActor in
                DataSeeder.seedExercises(modelContext: modelContainer.mainContext)
            }
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark) // Force Dark Mode
        }
        .modelContainer(container)
    }
}
