import SwiftUI
import Combine
import AudioToolbox

class RestTimerManager: ObservableObject {
    @Published var timeRemaining: TimeInterval = 0
    @Published var isRunning = false
    @Published var totalDuration: TimeInterval = 0
    
    private var timer: AnyCancellable?
    
    var progress: Double {
        guard totalDuration > 0 else { return 0 }
        return timeRemaining / totalDuration
    }
    
    var timeString: String {
        let minutes = Int(timeRemaining) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
    
    func start(duration: TimeInterval) {
        stop() // Clear existing
        totalDuration = duration
        timeRemaining = duration
        isRunning = true
        
        timer = Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.tick()
            }
    }
    
    func stop() {
        isRunning = false
        timer?.cancel()
        timer = nil
    }
    
    func add(seconds: TimeInterval) {
        if isRunning {
            timeRemaining += seconds
            totalDuration += seconds // Optionally extend total or just current? Usually just extend current.
        } else {
            start(duration: seconds)
        }
    }
    
    private func tick() {
        if timeRemaining > 0 {
            timeRemaining -= 1
        } else {
            stop()
            playAlertSound()
        }
    }
    
    private func playAlertSound() {
        // System Sound ID 1005 is a standard alert/alarm sound on iOS
        // 1013 is "Received Message"
        // 1022 is "Calendar Alert"
        AudioServicesPlaySystemSound(1005)
    }
}
