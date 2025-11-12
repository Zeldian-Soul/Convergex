import React from 'react'; // Import React
import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy notification data (replace with real data fetching later)
const NOTIFICATIONS = [
  { id: '1', type: 'closing', title: 'Registration Closing soon', body: 'Registration for your saved event "Chai Talk" is closing soon.', time: '12 Min', club: 'IEDC CET', read: false },
  { id: '2', type: 'start', title: 'Event Starts in 10 min', body: 'Your registered event "Tedtalk Secrets" will start in 10 min.', time: '12 Min', club: 'IEDC CET', read: false },
  { id: '3', type: 'closing', title: 'Registration Closing soon', body: 'Registration for your saved event "Chai Talk" is closing soon.', time: '12 Min', club: 'IEDC CET', read: true },
  // Add more dummy data as needed
];

export default function NotificationsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
    <Pressable style={[styles.notificationCard, !item.read && styles.unreadCard]}>
      <View style={[styles.iconContainer, item.type === 'start' ? styles.iconStart : styles.iconClosing]}>
        <Ionicons
          name={item.type === 'start' ? 'calendar-outline' : 'close-circle-outline'} // Changed icons slightly
          size={24}
          color="white"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.clubText}>{item.club}</Text>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.bodyText} numberOfLines={2}>{item.body}</Text>
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
         ListEmptyComponent={() => (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          )}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 24 },
  list: { padding: 12 },
   emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#888' },
  notificationCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12,
    marginBottom: 12, alignItems: 'flex-start',
  },
  unreadCard: { backgroundColor: '#e6f2ff' },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center',
    alignItems: 'center', marginRight: 12, marginTop: 4, // Added margin top
  },
  iconStart: { backgroundColor: '#28a745' }, // Green
  iconClosing: { backgroundColor: '#dc3545' }, // Red
  textContainer: { flex: 1, marginRight: 8 },
  clubText: { fontSize: 14, color: '#007bff', fontWeight: '600', marginBottom: 4 },
  titleText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#333' }, // Darker text
  bodyText: { fontSize: 14, color: '#555', lineHeight: 20 }, // Added line height
  timeText: { fontSize: 12, color: '#888' },
});