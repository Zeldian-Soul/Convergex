import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEvents } from "../context/EventsContext";

export default function AdminScreen() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  const [form, setForm] = useState({ title: "", venue: "", image: "" });
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    if (!form.title || !form.venue) {
      alert("Please fill all fields");
      return;
    }
    const eventData = { ...form, date: date.toISOString() };
    if (editingId) {
      updateEvent(editingId, eventData);
      setEditingId(null);
    } else {
      addEvent(eventData);
    }
    setForm({ title: "", venue: "", image: "" });
    setDate(new Date());
  };

  const startEdit = (event: any) => {
    setForm({ title: event.title, venue: event.venue, image: event.image });
    setDate(new Date(event.date));
    setEditingId(event.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👑 Admin Dashboard</Text>

      <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
      <TextInput style={styles.input} placeholder="Venue" value={form.venue} onChangeText={(t) => setForm({ ...form, venue: t })} />
      <TextInput style={styles.input} placeholder="Image URL" value={form.image} onChangeText={(t) => setForm({ ...form, image: t })} />

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Text style={{ color: "#fff" }}>📅 {date.toLocaleString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selected) => {
          if (Platform.OS === "android") {
            setShowPicker(false); // Android closes automatically
          }
          if (selected) {
            setDate(selected);
          }
        }}
        />

      )}

      <TouchableOpacity style={styles.addBtn} onPress={handleAddOrUpdate}>
        <Text style={styles.addText}>{editingId ? "✏️ Update Event" : "➕ Add Event"}</Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text>{new Date(item.date).toLocaleString()}</Text>
            <Text>{item.venue}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#28a745" }]} onPress={() => startEdit(item)}>
                <Text style={{ color: "#fff" }}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "red" }]} onPress={() => deleteEvent(item.id)}>
                <Text style={{ color: "#fff" }}>🗑 Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f7" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: "#fff" },
  dateBtn: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  addBtn: { backgroundColor: "#28a745", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  addText: { color: "#fff", fontWeight: "bold" },
  card: { backgroundColor: "#fff", padding: 14, marginBottom: 12, borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  image: { width: "100%", height: 120, borderRadius: 10, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  actionRow: { flexDirection: "row", marginTop: 8 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 6, marginHorizontal: 4, alignItems: "center" },
});
