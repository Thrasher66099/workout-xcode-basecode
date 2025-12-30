import SwiftUI
import SwiftData

struct HistoryView: View {
    @Environment(\.modelContext) var modelContext
    @Query(sort: \WorkoutSession.startTime, order: .reverse) private var sessions: [WorkoutSession]
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.strongBlack.ignoresSafeArea()
                
                if sessions.isEmpty {
                    VStack {
                        Image(systemName: "clock.arrow.circlepath")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                            .padding()
                        Text("No workout history yet.")
                            .foregroundColor(.gray)
                    }
                } else {
                    List {
                        ForEach(sessions) { session in
                            NavigationLink(destination: WorkoutDetailView(session: session)) {
                                VStack(alignment: .leading) {
                                    Text(session.startTime.formatted(date: .abbreviated, time: .shortened))
                                        .font(.headline)
                                        .foregroundColor(.white)
                                    if let note = session.note {
                                        Text(note)
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                }
                            }
                            .listRowBackground(Color.strongDarkGrey)
                        }
                        .onDelete(perform: deleteSession)
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("History")
        }
    }
    
    func deleteSession(at offsets: IndexSet) {
        for index in offsets {
            let session = sessions[index]
            modelContext.delete(session)
        }
    }
}
