import SwiftUI
import SwiftData
import Charts

struct ProfileView: View {
    @Query(sort: \WorkoutSession.startTime, order: .reverse) private var sessions: [WorkoutSession]
    @Query(sort: \WidgetConfiguration.sortOrder) private var widgetConfigs: [WidgetConfiguration]
    
    @State private var showingAddWidget = false
    @State private var showingGoalsSheet = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.strongBlack.ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header
                        HStack {
                        Button(action: { showingGoalsSheet = true }) {
                                Image(systemName: "gearshape.fill")
                                    .font(.title2)
                                    .foregroundColor(.strongBlue)
                            }
                            Spacer()
                            Button(action: {}) {
                                Image(systemName: "ruler.fill")
                                    .font(.title2)
                                    .foregroundColor(.strongBlue)
                            }
                        }
                        .padding(.horizontal)
                        
                        Text("Profile")
                            .font(.largeTitle)
                            .fontWeight(.heavy)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal)
                        
                        // Verification Banner
                        // Verification Banner
                        // TODO: Enable this when backend email verification is implemented
                        if false {
                            HStack {
                                Image(systemName: "exclamationmark.circle.fill")
                                Text("Please verify your email address.")
                                    .font(.subheadline)
                                Spacer()
                                Button("Details") { }
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                            }
                            .padding()
                            .background(Color.yellow)
                            .foregroundColor(.black)
                        }
                        
                        // User Info Card
                        HStack {
                            Circle()
                                .fill(Color.gray.opacity(0.3))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "person.fill")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: 30)
                                        .foregroundColor(.black)
                                )
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Kaleb Phillips")
                                    .font(.headline)
                                    .foregroundColor(.black)
                                Text("\(sessions.count) workouts")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(.strongBlue)
                        }
                        .padding()
                        .background(Color.white)
                        .cornerRadius(12) // Round corners
                        .padding(.horizontal)
                        
                        // Dashboard Header
                        HStack {
                            Text("Dashboard")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                            Spacer()
                            Button(action: { showingAddWidget = true }) {
                                HStack(spacing: 4) {
                                    Image(systemName: "plus")
                                    Text("Add")
                                }
                                .font(.headline)
                                .foregroundColor(.strongBlue)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.strongBlue.opacity(0.1))
                                .cornerRadius(8)
                            }
                        }
                        .padding(.horizontal)
                        
                        // Widgets
                        VStack(spacing: 16) {
                            if widgetConfigs.isEmpty {
                                Text("Tap '+ Add' to customize your dashboard")
                                    .foregroundColor(.gray)
                                    .padding()
                            }
                            
                            ForEach(widgetConfigs) { config in
                                switch config.type {
                                case "workouts":
                                    WorkoutsPerWeekWidget(config: config, sessions: sessions)
                                case "calories":
                                    CaloriesWeekWidget(config: config)
                                case "macros":
                                    FullDailyMacrosWidget(config: config)
                                case "measurement":
                                    MeasurementWidget(config: config)
                                case "exercise":
                                    ExerciseAnalyticsWidget(config: config)
                                default:
                                    Text("Unknown Widget") 
                                }
                            }
                        }
                        .padding(.horizontal)
                        
                        Spacer(minLength: 50)
                    }
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingAddWidget) {
                AddWidgetView()
            }
            .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("CloseAddWidgetSheet"))) { _ in
                showingAddWidget = false
            }
            .sheet(isPresented: $showingGoalsSheet) {
                UserGoalsView()
            }
        }
    }
}
