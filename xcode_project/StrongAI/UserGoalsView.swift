import SwiftUI
import SwiftData

struct UserGoalsView: View {
    @Environment(\.modelContext) var modelContext
    @Query var profiles: [UserProfile]
    @Environment(\.dismiss) var dismiss
    
    @State private var selectedGender: String = "Male"
    @State private var birthday: Date = Date()
    @State private var goalType: String = "Maintain" // Lose, Maintain, Gain
    @State private var targetWeeklyRate: Double = 0.5 // lbs per week
    @State private var activityLevel: String = "Moderate"
    
    let genders = ["Male", "Female"]
    let goals = ["Lose", "Maintain", "Gain"]
    let activityLevels = ["Sedentary", "Light", "Moderate", "Active", "Very Active"]
    
    // Rate options could be a slider or picker
    // 0.25, 0.5, 1.0, 1.5, 2.0
    let rateOptions: [Double] = [0.25, 0.5, 1.0, 1.5, 2.0]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Personal Details")) {
                    Picker("Gender", selection: $selectedGender) {
                        ForEach(genders, id: \.self) { gender in
                            Text(gender).tag(gender)
                        }
                    }
                    
                    DatePicker("Date of Birth", selection: $birthday, displayedComponents: .date)
                    
                    Picker("Activity Level", selection: $activityLevel) {
                        ForEach(activityLevels, id: \.self) { level in
                            Text(level).tag(level)
                        }
                    }
                }
                
                Section(header: Text("Fitness Goal")) {
                    Picker("Goal", selection: $goalType) {
                        ForEach(goals, id: \.self) { goal in
                            Text(goal).tag(goal)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    if goalType != "Maintain" {
                        VStack(alignment: .leading) {
                            Text("Target Rate (lbs/week)")
                            Picker("Target Rate", selection: $targetWeeklyRate) {
                                ForEach(rateOptions, id: \.self) { rate in
                                    Text("\(rate, specifier: "%.2f") lbs").tag(rate)
                                }
                            }
                            .pickerStyle(SegmentedPickerStyle())
                        }
                    }
                }
                
                Section(footer: Text("Values used to calculate daily caloric and macro needs automatically.")) {
                    Button(action: saveProfile) {
                        Text("Save Goals")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.strongBlue)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear(perform: loadData)
        }
    }
    
    func loadData() {
        if let profile = profiles.first {
            selectedGender = profile.selectedGender
            birthday = profile.birthday
            goalType = profile.goalType
            targetWeeklyRate = profile.targetWeeklyRate
            activityLevel = profile.activityLevel
        } else {
            // Defaults (approx 25 years old)
            birthday = Calendar.current.date(byAdding: .year, value: -25, to: Date()) ?? Date()
        }
    }
    
    func saveProfile() {
        if let profile = profiles.first {
            profile.selectedGender = selectedGender
            profile.birthday = birthday
            profile.goalType = goalType
            profile.targetWeeklyRate = targetWeeklyRate
            profile.activityLevel = activityLevel
        } else {
            let newProfile = UserProfile(
                gender: selectedGender,
                birthday: birthday,
                goalType: goalType,
                targetWeeklyRate: targetWeeklyRate,
                activityLevel: activityLevel
            )
            modelContext.insert(newProfile)
        }
        
        try? modelContext.save()
        dismiss()
    }
}
