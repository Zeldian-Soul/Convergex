import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useEvents } from "../context/EventsContext";

export default function EventDetailsScreen() {
  const route = useRoute<any>();
  const { eventId } = route.params;
  const { events, registerEvent, registered } = useEvents();

  const event = events.find((e) => e.id === eventId);
  if (!event) return <Text>Event not found.</Text>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: event.image }} style={styles.image} />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.date}>{new Date(event.date).toLocaleString()}</Text>
      <Text style={styles.venue}>📍 {event.venue}</Text>
      <Text style={styles.desc}>
        This is a placeholder description for {event.title}. Add more details like agenda, speakers, and club info here.
      </Text>

      <TouchableOpacity
        style={[styles.btn, registered.includes(event.id) && { backgroundColor: "gray" }]}
        onPress={() => {
          if (registered.includes(event.id)) {
            Alert.alert("Already Registered", "You are already registered for this event.");
          } else {
            registerEvent(event.id);
            Alert.alert("✅ Registered", "Reminder will be set automatically.");
          }
        }}
      >
        <Text style={styles.btnText}>{registered.includes(event.id) ? "✔ Registered" : "Register"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  image: { width: "100%", height: 220, borderRadius: 8, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  date: { fontSize: 16, color: "#666" },
  venue: { fontSize: 16, marginVertical: 8 },
  desc: { fontSize: 15, lineHeight: 20, color: "#444", marginBottom: 20 },
  btn: { backgroundColor: "#007bff", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
