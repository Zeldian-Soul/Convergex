import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useUser } from "../context/UserContext";

const CLUBS = ["Tech Club", "Music Club", "Drama Club", "Sports Club"];

export default function ProfileScreen() {
  const { user, logout, toggleClubFollow } = useUser();

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: "https://placekitten.com/200/200" }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.role}>{user.isAdmin ? "👑 Admin" : "🙋 User"}</Text>
            </View>
          </View>

          <Text style={styles.subHeader}>Your Clubs</Text>
          <View style={styles.clubsRow}>
            {CLUBS.map((club) => (
              <TouchableOpacity
                key={club}
                style={[
                  styles.clubTag,
                  user.clubs.includes(club) && { backgroundColor: "#007bff" },
                ]}
                onPress={() => toggleClubFollow(club)}
              >
                <Text style={{ color: user.clubs.includes(club) ? "#fff" : "#000" }}>
                  {user.clubs.includes(club) ? `✔ ${club}` : club}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>No user logged in</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f2f2f7" },
  profileHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 15 },
  name: { fontSize: 20, fontWeight: "bold" },
  email: { color: "#666" },
  role: { marginTop: 4, color: "#007bff", fontWeight: "600" },
  subHeader: { fontSize: 18, fontWeight: "600", marginVertical: 12 },
  clubsRow: { flexDirection: "row", flexWrap: "wrap" },
  clubTag: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: "#fff",
  },
  logoutBtn: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
});
