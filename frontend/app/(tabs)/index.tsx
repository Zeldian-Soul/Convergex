import React, { useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, ActivityIndicator,
  Image, Pressable, Share, Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { api, API_HOST_URL } from '../../constants/api';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type EventCardType = {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  clubId: number;
  clubName: string;
  clubLogoUrl: string | null;
  imageUrls: string[];
  isSaved: boolean;
  isRegistered: boolean;
  isFollowed: boolean;
  postedById: number;
};

// --- Stateful EventCard Component ---
const EventCard = ({ initialEventData }: { initialEventData: EventCardType }) => {
  const [event, setEvent] = useState(initialEventData);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hasImages = event.imageUrls && event.imageUrls.length > 0;
  const imageUrl = hasImages ? `${API_HOST_URL}${event.imageUrls[0]}` : null;
  const logoUrl = event.clubLogoUrl ? `${API_HOST_URL}${event.clubLogoUrl}` : null;

  const onSaveToggle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const wasSaved = event.isSaved;
    setEvent(prev => ({...prev, isSaved: !wasSaved}));

    try {
      if (wasSaved) {
        await api.delete(`/events/${event.id}/unsave`);
      } else {
        await api.post(`/events/${event.id}/save`);
      }
    } catch (e) {
      setEvent(prev => ({...prev, isSaved: wasSaved}));
      Alert.alert("Error", "Could not update save status.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onRegister = async () => {
    if (isProcessing || event.isRegistered) return;
    
    Alert.alert(
      "Confirm Registration",
      `Register for "${event.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: async () => {
            setIsProcessing(true);
            try {
              await api.post(`/events/${event.id}/register`);
              setEvent(prev => ({...prev, isRegistered: true}));
              Alert.alert("Success", "Registered for event!");
            } catch (e: any) {
              Alert.alert("Error", e.response?.data?.message || "Could not register.");
            } finally {
              setIsProcessing(false);
            }
        }}
      ]
    );
  };
  
  const onFollowToggle = async () => {
     if (isProcessing) return;
     setIsProcessing(true);
     const wasFollowed = event.isFollowed;
     setEvent(prev => ({...prev, isFollowed: !wasFollowed}));
     
     try {
        if (wasFollowed) {
          await api.delete(`/follow/${event.clubId}`);
        } else {
          await api.post(`/follow/${event.clubId}`);
        }
     } catch (e: any) {
        setEvent(prev => ({...prev, isFollowed: wasFollowed}));
        console.error("Follow Toggle Error:", e.response?.data);
        Alert.alert("Error", e.response?.data?.message || "Could not follow club.");
     } finally {
        setIsProcessing(false);
     }
  };
  
  const onShare = async () => {
      try {
        await Share.share({
          message: `Check out this event: ${event.title}\n\n${event.description || ''}`,
        });
      } catch (error: any) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.clubInfo}>
           {logoUrl ? (
               <Image source={{ uri: logoUrl }} style={styles.clubLogo} />
           ) : (
               <View style={styles.clubLogo} />
           )}
           <Text style={styles.clubName}>{event.clubName || "Club Name"}</Text>
         </View>
        <Pressable 
          style={[styles.followButton, event.isFollowed ? styles.followingButton : {}]}
          onPress={onFollowToggle}
          disabled={isProcessing}
        >
          <Text style={[styles.followButtonText, event.isFollowed ? styles.followingButtonText : {}]}>
            {event.isFollowed ? "Following" : "Follow"}
          </Text>
        </Pressable>
      </View>
      
      <Link href={`/event/${event.id}`} asChild>
        <Pressable>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.eventImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.eventMetaText}>{event.eventDate}</Text>
              <Text style={styles.eventMetaText}>{event.eventTime}</Text>
              <Text style={styles.eventMetaText}>{event.location || "N/A"}</Text>
            </View>
          </View>
        </Pressable>
      </Link>
      
      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={onSaveToggle} disabled={isProcessing}>
          <Ionicons name={event.isSaved ? "bookmark" : "bookmark-outline"} size={22} color={event.isSaved ? "#007bff" : "#555"} />
          <Text style={[styles.actionText, event.isSaved && {color: "#007bff"}]}>
             {event.isSaved ? "Saved" : "Save"}
          </Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-social-outline" size={22} color="#555" />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
        <Pressable 
          style={[styles.actionButton, styles.registerButtonMini, event.isRegistered && styles.registeredButtonMini]} 
          onPress={onRegister}
          disabled={isProcessing || event.isRegistered}
        >
          <Text style={[styles.registerTextMini, event.isRegistered && {color: "#28a745"}]}>
            {event.isRegistered ? "Registered" : "Register"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [events, setEvents] = useState<EventCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<'general' | 'subscribed'>('general');

  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN');

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [feedType])
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = feedType === 'general' ? '/events' : '/events/feed';
      const response = await api.get(endpoint);
      
      const sortedEvents = response.data.sort((a: EventCardType, b: EventCardType) => b.id - a.id);
      setEvents(sortedEvents);

    } catch (e: any) {
      setError("Failed to fetch events. Backend running?");
      console.error("fetchEvents Error:", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ConvergeX</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconButton} onPress={() => router.push('/search')}>
            <Ionicons name="search" size={24} color="black" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </Pressable>
        </View>
      </View>
      <View style={styles.filterContainer}>
         <Pressable 
            style={[styles.filterButton, feedType === 'general' && styles.filterActive]} 
            onPress={() => setFeedType('general')}>
            <Text style={[styles.filterText, feedType === 'general' && styles.filterTextActive]}>General</Text>
         </Pressable>
         <Pressable 
            style={[styles.filterButton, feedType === 'subscribed' && styles.filterActive]} 
            onPress={() => setFeedType('subscribed')}>
            <Text style={[styles.filterText, feedType === 'subscribed' && styles.filterTextActive]}>Subscribed</Text>
         </Pressable>
      </View>
    </View>
  );

  if (loading && events.length === 0) { // Only show full screen loader on initial load
     return (
       <SafeAreaView style={styles.container}>
         {renderHeader()}
         <View style={styles.center}>
           <ActivityIndicator style={{marginTop: 50}} size="large" color="#007bff" />
           <Text>Loading events...</Text>
         </View>
       </SafeAreaView>
     );
  }

  if (error) {
     return (
       <SafeAreaView style={styles.container}>
         {renderHeader()}
         <View style={styles.center}>
           <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={fetchEvents} style={{marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 5}}>
               <Text style={{color: '#007bff'}}>Retry</Text>
            </Pressable>
         </View>
       </SafeAreaView>
     );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventCard initialEventData={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{fontSize: 16, color: '#666'}}>
              {feedType === 'subscribed' 
                ? "No events from clubs you follow." 
                : "No events found."}
            </Text>
          </View>
        )}
        onRefresh={fetchEvents}
        refreshing={loading} // Shows the pull-to-refresh spinner
      />
      {isAdmin && (
        <Pressable style={styles.fab} onPress={() => router.push('/create')}>
          <MaterialIcons name="add" size={28} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10, fontSize: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0'
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginLeft: 16 },
  filterContainer: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#fff', paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0'
  },
  filterButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  filterActive: { backgroundColor: '#e6f2ff' },
  filterText: { color: '#555', fontWeight: '600', fontSize: 16 },
  filterTextActive: { color: '#007bff' },
  card: {
    backgroundColor: '#ffffff', marginVertical: 8,
    borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12,
  },
  clubInfo: { flexDirection: 'row', alignItems: 'center' },
  clubLogo: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#e0e0e0', marginRight: 10,
    borderWidth: 1, borderColor: '#eee'
  },
  clubName: { fontWeight: 'bold', fontSize: 16 },
  followButton: {
    borderColor: '#007bff', borderWidth: 1.5, paddingVertical: 6,
    paddingHorizontal: 16, borderRadius: 20, minWidth: 90, alignItems: 'center'
  },
  followingButton: { backgroundColor: '#007bff' },
  followButtonText: { color: '#007bff', fontWeight: 'bold' },
  followingButtonText: { color: '#fff' },
  imagePlaceholder: {
    width: '100%', height: 300, backgroundColor: '#f8f8f8',
    justifyContent: 'center', alignItems: 'center',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee'
  },
  eventImage: { width: '100%', height: 300, resizeMode: 'cover' },
  cardContent: { padding: 12 },
  eventTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  eventMeta: { flexDirection: 'row', marginBottom: 8 },
  eventMetaText: { fontSize: 14, color: '#555', marginRight: 12 },
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  actionText: { marginLeft: 6, fontSize: 14, color: '#555', fontWeight: '600' },
  registerButtonMini: {
    backgroundColor: '#e6f2ff', paddingHorizontal: 16,
    paddingVertical: 6, borderRadius: 15,
  },
  registeredButtonMini: { backgroundColor: '#e6f9f0' },
  registerTextMini: { color: '#007bff', fontWeight: 'bold' },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#007bff', justifyContent: 'center',
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
});