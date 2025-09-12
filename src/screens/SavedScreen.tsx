import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useEvents } from "../context/EventsContext";

export default function SavedScreen() {
  const { events, saved } = useEvents();
  const savedEvents = events.filter((e) => saved.includes(e.id));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💾 Saved Events</Text>
      <FlatList
        data={savedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No saved events yet. Bookmark some!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f7" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
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
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  date: { color: "#666" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#888" },
});
