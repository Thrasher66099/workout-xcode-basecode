import SwiftUI
import SwiftData
import Charts

struct ExerciseProgressView: View {
    let exerciseName: String
    @Query private var sets: [WorkoutSet]
    
    init(exerciseName: String) {
        self.exerciseName = exerciseName
        // Filter sets matching this exercise name and valid weight
        _sets = Query(filter: #Predicate<WorkoutSet> { set in
            set.exerciseName == exerciseName && set.weight > 0 && set.isCompleted
        }, sort: \.index) // Sorting by index isn't great for time, but we group below
    }
    
    // Data point for the graph
    struct ProgressDataPoint: Identifiable {
        let id = UUID()
        let date: Date
        let maxWeight: Double
    }
    
    var progressData: [ProgressDataPoint] {
        // Group by Date (Day) and find Max Weight
        let grouped = Dictionary(grouping: sets) { set in
            // Group by Day
            Calendar.current.startOfDay(for: set.session?.startTime ?? Date())
        }
        
        return grouped.map { (date, dailySets) in
            let maxWeight = dailySets.map { $0.weight }.max() ?? 0
            return ProgressDataPoint(date: date, maxWeight: maxWeight)
        }.sorted { $0.date < $1.date }
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Weight Progress")
                .font(.headline)
                .foregroundColor(.white)
                .padding(.bottom, 8)
            
            if progressData.isEmpty {
                Text("No data available yet.")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .frame(height: 200)
                    .frame(maxWidth: .infinity)
                    .background(Color.strongDarkGrey)
                    .cornerRadius(12)
            } else {
                Chart(progressData) { point in
                    LineMark(
                        x: .value("Date", point.date),
                        y: .value("Weight", point.maxWeight)
                    )
                    .symbol(.circle)
                    .interpolationMethod(.catmullRom)
                    .foregroundStyle(Color.strongBlue)
                    
                    AreaMark(
                        x: .value("Date", point.date),
                        y: .value("Weight", point.maxWeight)
                    )
                    .interpolationMethod(.catmullRom)
                    .foregroundStyle(
                        LinearGradient(
                            colors: [Color.strongBlue.opacity(0.3), Color.clear],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                }
                .frame(height: 200)
                .padding()
                .background(Color.strongDarkGrey)
                .cornerRadius(12)
                .chartYScale(domain: .automatic(includesZero: false))
            }
        }
        .padding()
    }
}
