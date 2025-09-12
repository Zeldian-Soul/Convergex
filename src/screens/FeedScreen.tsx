import React from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useEvents } from "../context/EventsContext";
import { useNavigation } from "@react-navigation/native";

export default function FeedScreen() {
  const { events, toggleSave, saved } = useEvents();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
              <Text style={styles.venue}>📍 {item.venue}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    saved.includes(item.id) && { backgroundColor: "#ffcc00" },
                  ]}
                  onPress={() => toggleSave(item.id)}
                >
                  <Text
                    style={[
                      styles.btnText,
                      saved.includes(item.id) && { color: "#000" },
                    ]}
                  >
                    {saved.includes(item.id) ? "💾 Saved" : "🔖 Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#007bff" }]}
                  onPress={() =>
                    navigation.navigate("EventDetails", { eventId: item.id })
                  }
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No events available right now.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7", padding: 10 },
  card: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: { width: "100%", height: 220 },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  date: { color: "#888", marginBottom: 4 },
  venue: { color: "#444", marginBottom: 12 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  btn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#eee",
  },
  btnText: { fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#888" },
});
