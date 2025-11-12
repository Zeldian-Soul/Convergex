import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable, Image, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
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

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
};

const reformatDateForCalendar = (dateStr: string | undefined | null): string | null => {
  if (!dateStr) return null;
  try {
    // Assuming format is DD/MM/YYYY from backend Event model (adjust if different)
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Pad month and day if needed
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`; // Format for react-native-calendars
    }
    // Attempt parsing if format is different (e.g., from DatePicker)
    const dateObj = new Date(dateStr);
    if (!isNaN(dateObj.getTime())) {
       return dateObj.toISOString().split('T')[0];
    }
    console.warn("Invalid date format received:", dateStr);
    return null;
  } catch (e) {
    console.warn("Error reformatting date:", dateStr, e);
    return null;
  }
};


const EventListCard = ({ event }: { event: Event }) => {
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
          <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
          <Text style={styles.cardMeta}>{event.eventTime} · {event.location}</Text>
        </View>
      </Pressable>
    </Link>
  );
};


export default function CalendarScreen() {
  const [allRegisteredEvents, setAllRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const todayString = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayString);

  useFocusEffect(
    React.useCallback(() => {
      fetchRegisteredEvents();
    }, [])
  );

  const fetchRegisteredEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/registrations/my-events');
      setAllRegisteredEvents(response.data);
    } catch (e: any) {
      console.error("Failed to fetch registered events:", e.response?.data || e.message);
       if (e.response?.status !== 401) {
          Alert.alert("Error", "Failed to fetch registered events.");
       }
    } finally {
      setLoading(false);
    }
  };

  const marked = useMemo(() => {
    const marks: MarkedDates = {};
    allRegisteredEvents.forEach(event => {
      const formattedDate = reformatDateForCalendar(event.eventDate);
      if (formattedDate) {
        marks[formattedDate] = { marked: true, dotColor: '#007bff' };
      }
    });
    marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#007bff', marked: !!marks[selectedDate]?.marked }; // Keep dot if marked
    return marks;
  }, [allRegisteredEvents, selectedDate]);

  const eventsForSelectedDay = useMemo(() => {
    return allRegisteredEvents.filter(event => {
      const formattedDate = reformatDateForCalendar(event.eventDate);
      return formattedDate === selectedDate;
    });
  }, [allRegisteredEvents, selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        current={todayString}
        onDayPress={onDayPress}
        markedDates={marked}
        theme={{
          todayTextColor: '#007bff',
          arrowColor: '#007bff',
          selectedDayBackgroundColor: '#007bff', // Ensure selected color is set
          selectedDayTextColor: '#ffffff',
          dotColor: '#007bff', // Default dot color
          // selectedDotColor: '#ffffff', // Optional: if needed
        }}
      />

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          Events for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007bff"/>
      ) : (
        <FlatList
          data={eventsForSelectedDay}
          renderItem={({ item }) => <EventListCard event={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No registered events for this day.</Text>
            </View>
          )}
          onRefresh={fetchRegisteredEvents} // Add pull-to-refresh
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    listHeader: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f0f2f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    listHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#333' }, // Darker text
    list: { padding: 16 },
    emptyList: { alignItems: 'center', marginTop: 30, flex: 1 }, // Take remaining space
    emptyText: { fontSize: 16, color: '#888' },
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
    cardImage: { width: 80, height: 80 },
    imagePlaceholder: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#333'},
    cardMeta: { fontSize: 14, color: '#777' },
});