import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { useEvents } from "../context/EventsContext";

export default function CalendarScreen() {
  const { events, registered } = useEvents();
  const [selectedDate, setSelectedDate] = useState("");

  const eventsForDate = events.filter(
    (e) => registered.includes(e.id) && e.date.startsWith(selectedDate)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📅 Calendar</Text>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: "#007bff" } }}
        theme={{
          todayTextColor: "#007bff",
          arrowColor: "#007bff",
        }}
      />

      <Text style={styles.subHeader}>Registered Events</Text>
      <FlatList
        data={eventsForDate}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {selectedDate ? "No events for this day." : "Pick a date to see events."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f7" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  subHeader: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600" },
  date: { color: "#555" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#888" },
});
