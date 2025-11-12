import React from 'react'; // Import React
import { useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable, Image, Alert } from 'react-native';
import { api, API_HOST_URL } from '../../constants/api';
import { Link, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Event = {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  clubName: string;
  imageUrls: string[];
};

const SavedEventCard = ({ event }: { event: Event }) => {
  const imageUrl = event.imageUrls && event.imageUrls.length > 0
    ? `${API_HOST_URL}${event.imageUrls[0]}`
    : null;

  return (
    <Link href={`/event/${event.id}`} asChild>
      <Pressable style={styles.card}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]} >
             <Ionicons name="image-outline" size={30} color="#ccc" />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardClub}>{event.clubName}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.cardMeta}>{event.eventDate} · {event.location}</Text>
        </View>
      </Pressable>
    </Link>
  );
};


export default function SavedScreen() {
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchSavedEvents();
    }, [])
  );

  const fetchSavedEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/saved');
      setSavedEvents(response.data);
    } catch (e: any) {
      console.error("Failed to fetch saved posts:", e.response?.data || e.message);
      // Only show alert if it's not a 401 (handled globally perhaps)
      if (e.response?.status !== 401) {
         Alert.alert("Error", "Failed to fetch saved posts.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Posts</Text>
      </View>
      <FlatList
        data={savedEvents}
        renderItem={({ item }) => <SavedEventCard event={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={styles.emptyText}>You haven't saved any events yet.</Text>
          </View>
        )}
        onRefresh={fetchSavedEvents} // Add pull-to-refresh
        refreshing={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#888' },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  list: { padding: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: { width: 100, height: 100 },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1, padding: 12 },
  cardClub: { fontSize: 14, color: '#555', fontWeight: '600', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  cardMeta: { fontSize: 14, color: '#777' },
});