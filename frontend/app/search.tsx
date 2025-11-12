import React, { useState, useEffect } from 'react'; // Import React
import { StyleSheet, Text, View, TextInput, FlatList, ActivityIndicator, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, API_HOST_URL } from '../constants/api';
import { useRouter, Link } from 'expo-router';
import { useDebounce } from '../hooks/useDebounce';
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

const SearchResultCard = ({ event }: { event: Event }) => {
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


export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchEvents = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setLoading(false); // Stop loading if query is too short
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/events/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(response.data);
      } catch (e: any) {
        console.error("Search Error:", e.response?.data || e.message);
        // Alert("Error", "Failed to search events."); // Optional alert
      } finally {
        setLoading(false);
      }
    };

    searchEvents();
  }, [debouncedQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchHeader}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for events by title..."
          value={query}
          onChangeText={setQuery}
          autoFocus={true}
          clearButtonMode="while-editing" // iOS clear button
        />
        {loading && <ActivityIndicator style={{ marginLeft: 10 }} color="#007bff"/>}
      </View>

      <FlatList
        data={results}
        renderItem={({ item }) => <SearchResultCard event={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>
              {loading ? "" : query.length > 1 ? "No results found." : "Enter at least 2 characters to search."}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fff'
  },
  searchInput: { flex: 1, fontSize: 18, marginLeft: 16 },
  list: { padding: 16 },
  emptyList: { alignItems: 'center', marginTop: 40, flex: 1 },
  emptyText: { fontSize: 16, color: '#888' },
  card: {
    flexDirection: 'row', backgroundColor: 'white', borderRadius: 8, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    marginBottom: 12, overflow: 'hidden',
  },
  cardImage: { width: 100, height: 100 },
  imagePlaceholder: { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, padding: 12 },
  cardClub: { fontSize: 14, color: '#555', fontWeight: '600', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  cardMeta: { fontSize: 14, color: '#777' },
});