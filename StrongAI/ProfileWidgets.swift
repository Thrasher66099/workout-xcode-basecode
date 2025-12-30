import SwiftUI
import SwiftData
import Charts

struct WidgetMenu: View {
    let config: WidgetConfiguration
    @Environment(\.modelContext) var modelContext
    
    var body: some View {
        Menu {
            Button(role: .destructive) {
                modelContext.delete(config)
            } label: {
                Label("Remove Widget", systemImage: "trash")
            }
        } label: {
            Image(systemName: "ellipsis")
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.strongBlue)
                .frame(width: 36, height: 36)
                .background(Color.strongBlue.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

// MARK: - Measurement Widget
struct MeasurementWidget: View {
    let config: WidgetConfiguration
    @Query private var logs: [MeasurementLog]
    @State private var showingLogSheet = false
    
    init(config: WidgetConfiguration) {
        self.config = config
        let type = config.measurementType ?? ""
        _logs = Query(filter: #Predicate { $0.type == type }, sort: \MeasurementLog.date, order: .forward)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text(config.measurementType ?? "Measurement")
                        .font(.headline)
                        .foregroundColor(.black)
                    Text("Absolute")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                
                Button(action: { showingLogSheet = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.strongBlue)
                }
                
                WidgetMenu(config: config)
            }
            
            if logs.isEmpty {
                Text("No data yet.")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .frame(height: 150)
                    .frame(maxWidth: .infinity)
            } else {
                Chart(logs) { log in
                    LineMark(
                        x: .value("Date", log.date),
                        y: .value("Value", log.value)
                    )
                    .foregroundStyle(Color.purple)
                    .interpolationMethod(.catmullRom)
                    
                    PointMark(
                        x: .value("Date", log.date),
                        y: .value("Value", log.value)
                    )
                    .foregroundStyle(Color.strongBlue)
                }
                .frame(height: 150)
                .chartYAxis {
                    AxisMarks(position: .trailing)
                }
                .chartXAxis {
                    AxisMarks(position: .bottom)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .sheet(isPresented: $showingLogSheet) {
            LogMeasurementView(type: config.measurementType ?? "Weight", unit: "lb") // Default unit logic needing refinement
        }
    }
}

// MARK: - Exercise Analytics Widget
struct ExerciseAnalyticsWidget: View {
    let config: WidgetConfiguration
    @Query private var sets: [WorkoutSet]
    
    init(config: WidgetConfiguration) {
        self.config = config
        let exerciseId = config.exerciseId ?? UUID()
        _sets = Query(filter: #Predicate { $0.exerciseId == exerciseId && $0.isCompleted }, sort: \.session?.startTime, order: .forward)
    }
    
    // Helper to calculate data points based on metric
    var dataPoints: [(date: Date, value: Double)] {
        // Group by session/date. This is a simplified implementation.
        // In a real app, optimize this Query or grouping logic.
        
        var points: [(Date, Double)] = []
        
        let grouped = Dictionary(grouping: sets) { $0.session?.startTime ?? Date() }
        let sortedDates = grouped.keys.sorted()
        
        for date in sortedDates {
            guard let sessionSets = grouped[date] else { continue }
            
            var value: Double = 0
            
            switch config.exerciseMetric {
            case "Est. 1RM", "Best Set (Est. 1RM)", "PR Progression (as 1RM)":
                value = sessionSets.map { calculate1RM(weight: $0.weight, reps: $0.reps) }.max() ?? 0
            case "Max Weight", "Best Set (Max Weight)":
                value = sessionSets.map { $0.weight }.max() ?? 0
            case "Volume", "Total Volume":
                value = sessionSets.reduce(0) { $0 + ($1.weight * Double($1.reps)) }
            case "Max Consecutive Reps":
                 value = Double(sessionSets.map { $0.reps }.max() ?? 0)
            default:
                value = 0
            }
            
            if value > 0 {
                points.append((date, value))
            }
        }
        
        return points
    }
    
    func calculate1RM(weight: Double, reps: Int) -> Double {
        // Epley formula
        if reps == 1 { return weight }
        return weight * (1 + (Double(reps) / 30.0))
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    // We need to fetch exercise name, but for now we might rely on cached name or query
                    // Ideally we'd pass the name in or have a lighter lookup.
                    // For MVP let's just use "Exercise" or fetch if we can. 
                    // Since we have exerciseId we can find it if we had access to exercises array
                    Text(sets.first?.exerciseName ?? "Exercise Analytics") 
                        .font(.headline)
                        .foregroundColor(.black)
                    Text(config.exerciseMetric ?? "Metric")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                Image(systemName: "arrow.up.left.and.arrow.down.right") // Expand icon
                    .foregroundColor(.strongBlue)
                WidgetMenu(config: config)
            }
            
            if dataPoints.isEmpty {
                Text("No data enough for chart.")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .frame(height: 150)
                    .frame(maxWidth: .infinity)
            } else {
                Chart(dataPoints, id: \.date) { item in
                    LineMark(
                        x: .value("Date", item.0),
                        y: .value("Value", item.1)
                    )
                    .foregroundStyle(Color.purple.opacity(0.5))
                    .interpolationMethod(.catmullRom)
                    
                    PointMark(
                        x: .value("Date", item.0),
                        y: .value("Value", item.1)
                    )
                    .foregroundStyle(Color.purple)
                }
                .frame(height: 150)
                .chartYAxis {
                    AxisMarks(position: .trailing)
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

struct MacroRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.black)
        }
    }
}

// MARK: - Updated Daily Macros Widget (No Lock)
struct FullDailyMacrosWidget: View {
    let config: WidgetConfiguration
    @Query private var userProfiles: [UserProfile]
    @Query(sort: \MeasurementLog.date, order: .reverse) private var weightLogs: [MeasurementLog] // To get latest weight
    @State private var showingGoalsSheet = false

    var body: some View {
        let profile = userProfiles.first
        
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Daily Macros")
                        .font(.headline)
                        .foregroundColor(.black)
                    Text("Nutrition")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                Image(systemName: "target")
                    .foregroundColor(.strongBlue)
                WidgetMenu(config: config)
            }
            
            if let profile = profile {
                let currentWeight = weightLogs.first(where: { $0.type == "Weight" })?.value ?? 150.0 
                let macros = profile.calculateDailyMacros(currentWeightLbs: currentWeight, heightInches: 70) 
            
                HStack {
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                            .frame(width: 80, height: 80)
                        
                        VStack {
                            Text("\(macros.calories)")
                                .font(.headline)
                                .foregroundColor(.gray)
                            Text("kcal")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.trailing)
                    
                    VStack(spacing: 8) {
                        MacroRow(label: "Protein", value: "0 / \(macros.protein) g")
                        MacroRow(label: "Fat", value: "0 / \(macros.fat) g")
                        MacroRow(label: "Carbs", value: "0 / \(macros.carbs) g")
                    }
                }
            } else {
                VStack(spacing: 8) {
                    Text("Set up your profile to calculate macros.")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Button(action: { showingGoalsSheet = true }) {
                        Text("Set Goals")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.strongBlue)
                            .cornerRadius(8)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
        .sheet(isPresented: $showingGoalsSheet) {
            UserGoalsView()
        }
    }
}

// MARK: - Calories Week Widget
struct CaloriesWeekWidget: View {
    let config: WidgetConfiguration
    @Query private var calorieLogs: [MeasurementLog]
    
    init(config: WidgetConfiguration) {
        self.config = config
        _calorieLogs = Query(filter: #Predicate { $0.type == "Caloric Intake" }, sort: \MeasurementLog.date, order: .forward)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Calories This Week")
                        .font(.headline)
                        .foregroundColor(.black)
                    Text("Nutrition")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                Image(systemName: "flame.fill")
                    .foregroundColor(.orange)
                WidgetMenu(config: config)
            }
            
            if calorieLogs.isEmpty {
                Text("Not enough data for chart.")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .frame(height: 150)
                    .frame(maxWidth: .infinity)
            } else {
                Chart(calorieLogs) { log in
                    BarMark(
                        x: .value("Date", log.date, unit: .day),
                        y: .value("Calories", log.value)
                    )
                    .foregroundStyle(Color.orange)
                }
                .frame(height: 150)
                .chartXAxis {
                    AxisMarks(position: .bottom, values: .stride(by: .day)) { value in
                         AxisValueLabel(format: .dateTime.weekday())
                    }
                }
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(16)
    }
}

// MARK: - Workouts Per Week Widget
// MARK: - Workouts Per Week Widget
// MARK: - Workouts Per Week Widget
struct WorkoutsPerWeekWidget: View {
    let config: WidgetConfiguration
    let sessions: [WorkoutSession]
    
    @Query private var userProfiles: [UserProfile]
    @Environment(\.modelContext) var modelContext
    

    
    init(config: WidgetConfiguration, sessions: [WorkoutSession]) {
        self.config = config
        self.sessions = sessions
    }
    
    var weeklyData: [(date: Date, count: Int)] {
        let calendar = Calendar.current
        let today = Date()
        
        // Find the start of the current week (Sunday or Monday depending on locale, usually Sunday for US charts)
        // Adjust to be explicitly consistently aligned if needed, but 'weekOfYear' usage handles it.
        // Let's get the start of the current week.
        guard let startOfCurrentWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else {
            return []
        }
        
        var weeks: [(Date, Int)] = []
        
        // Generate last 8 weeks (Current + 7 previous)
        for i in 0..<8 {
            if let date = calendar.date(byAdding: .weekOfYear, value: -i, to: startOfCurrentWeek) {
                weeks.append((date, 0))
            }
        }
        weeks.reverse() // Sort oldest (left) to newest (right)
        
        // Fill in counts
        // Group sessions by their week start
        let grouped = Dictionary(grouping: sessions) { session -> Date in
            let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: session.startTime)
            return calendar.date(from: components) ?? session.startTime
        }
        
        // Merge counts into the generated weeks
        return weeks.map { weekItem in
            let count = grouped[weekItem.0]?.count ?? 0
            return (date: weekItem.0, count: count)
        }
    }
    
    func updateGoal(_ newGoal: Int) {
        if let profile = userProfiles.first {
            profile.workoutsPerWeekGoal = newGoal
        } else {
            // Create basic profile if missing
            let newProfile = UserProfile(workoutsPerWeekGoal: newGoal)
            modelContext.insert(newProfile)
        }
    }
    
    var body: some View {
        let profile = userProfiles.first
        let goal = profile?.workoutsPerWeekGoal ?? 5
        
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Workouts Per Week")
                        .font(.title3) // Slightly larger, bold
                        .fontWeight(.bold)
                        .foregroundColor(.black)
                    Text("Activity")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                HStack(spacing: 8) {
                    Menu {
                        Picker("Target", selection: Binding(
                            get: { goal },
                            set: { updateGoal($0) }
                        )) {
                            ForEach(1...7, id: \.self) { i in
                                Text("\(i) Workouts").tag(i)
                            }
                        }
                    } label: {
                        Image(systemName: "target")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.strongBlue)
                            .frame(width: 36, height: 36)
                            .background(Color.strongBlue.opacity(0.1))
                            .clipShape(Circle())
                    }
                    
                    WidgetMenu(config: config)
                }
            }
            
            // Chart
            Chart {
                // Goal Line
                RuleMark(y: .value("Goal", goal))
                    .foregroundStyle(Color.purple.opacity(0.5))
                    .lineStyle(StrokeStyle(lineWidth: 1))
                    .annotation(position: .trailing, alignment: .center) {
                        Text("\(goal)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.purple)
                    }
                
                ForEach(weeklyData, id: \.date) { item in
                    BarMark(
                        x: .value("Week", item.date, unit: .weekOfYear),
                        y: .value("Workouts", item.count)
                    )
                    .foregroundStyle(Color.purple.opacity(0.6))
                    .cornerRadius(4)
                }
            }
            .frame(height: 180)
            .chartXAxis {
                AxisMarks(values: .stride(by: .weekOfYear)) { value in
                    AxisValueLabel(format: .dateTime.month(.defaultDigits).day(), centered: true, collisionResolution: .greedy)
                        .foregroundStyle(Color.gray)
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading, values: .automatic) { value in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4, 4]))
                        .foregroundStyle(Color.gray.opacity(0.3))
                    AxisValueLabel()
                        .foregroundStyle(Color.gray)
                }
            }
        }
        .padding(20)
        .background(Color.white)
        .cornerRadius(24) // Match card look
    }
}
