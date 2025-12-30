import SwiftUI
import SwiftData

struct LogMeasurementView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(\.modelContext) var modelContext
    
    let type: String
    let unit: String
    @State private var value: Double?
    @State private var date = Date()
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("New Entry")) {
                    HStack {
                        Text(type)
                        Spacer()
                        TextField("Value", value: $value, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                        Text(unit)
                            .foregroundColor(.gray)
                    }
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
            }
            .navigationTitle("Log \(type)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveLog()
                    }
                    .disabled(value == nil)
                }
            }
        }
    }
    
    func saveLog() {
        guard let validValue = value else { return }
        
        // Check if entry exists for this day and type? For now just append.
        let log = MeasurementLog(date: date, type: type, value: validValue, unit: unit)
        modelContext.insert(log)
        
        dismiss()
    }
}
