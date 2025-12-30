import SwiftUI

// MARK: - Color Palette
extension Color {
    static let strongBlack = Color(red: 0.05, green: 0.05, blue: 0.05) // Deep OLED black equivalent
    static let strongDarkGrey = Color(red: 0.12, green: 0.12, blue: 0.12) // Card background
    static let strongBlue = Color(red: 0.23, green: 0.51, blue: 0.96) // Action Blue
    static let strongGreen = Color(red: 0.06, green: 0.73, blue: 0.51) // Success Green
    static let strongRed = Color(red: 0.93, green: 0.28, blue: 0.28) // Delete/Fail
}

// MARK: - View Modifiers
struct PrimaryButtonModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.strongBlue)
            .cornerRadius(10)
    }
}

struct CardBackgroundModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.strongDarkGrey)
            .cornerRadius(12)
    }
}

extension View {
    func primaryButtonStyle() -> some View {
        modifier(PrimaryButtonModifier())
    }
    
    func cardStyle() -> some View {
        modifier(CardBackgroundModifier())
    }
}
