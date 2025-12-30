import SwiftUI

struct RecapView: View {
    let session: WorkoutSession
    var onDismiss: () -> Void
    
    var body: some View {
        VStack(spacing: 30) {
            Text("Workout Complete!")
                .font(.largeTitle)
                .fontWeight(.heavy)
                .foregroundColor(.white)
                .padding(.top, 50)
            
            Text("Great job! Here's your summary.")
                .foregroundColor(.gray)
            
            VStack(spacing: 20) {
                // Duration
                HStack {
                    Image(systemName: "clock")
                        .foregroundColor(.strongBlue)
                    Text("Duration")
                        .foregroundColor(.gray)
                    Spacer()
                    Text(session.durationString)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                .padding()
                .background(Color.strongDarkGrey)
                .cornerRadius(10)
                
                // Volume
                HStack {
                    Image(systemName: "dumbbell.fill")
                        .foregroundColor(.strongBlue)
                    Text("Total Volume")
                        .foregroundColor(.gray)
                    Spacer()
                    Text("\(Int(calculateVolume())) kg")
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                .padding()
                .background(Color.strongDarkGrey)
                .cornerRadius(10)
                
                // Sets
                HStack {
                    Image(systemName: "number")
                        .foregroundColor(.strongBlue)
                    Text("Sets Completed")
                        .foregroundColor(.gray)
                    Spacer()
                    Text("\(session.sets.filter { $0.isCompleted }.count)")
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                .padding()
                .background(Color.strongDarkGrey)
                .cornerRadius(10)
            }
            .padding(.horizontal)
            
            Spacer()
            
            Button(action: onDismiss) {
                Text("Done")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.strongBlue)
                    .cornerRadius(12)
            }
            .padding()
            .padding(.bottom, 20)
        }
        .background(Color.strongBlack.ignoresSafeArea())
    }
    
    func calculateVolume() -> Double {
        return session.sets.reduce(0) { total, set in
            if set.isCompleted {
                return total + (set.weight * Double(set.reps))
            }
            return total
        }
    }
}

// Helper extension if not already present in Models
extension WorkoutSession {
    var durationString: String {
        let duration = endTime?.timeIntervalSince(startTime) ?? 0
        let hours = Int(duration) / 3600
        let minutes = Int(duration) / 60 % 60
        return String(format: "%dh %02dm", hours, minutes)
    }
}
