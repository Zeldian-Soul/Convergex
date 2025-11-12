import { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, ScrollView, Image, Pressable,
    ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, API_HOST_URL } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type EventDetails = {
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
  postedById: number;
  isFollowed: boolean;
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);


  const fetchEventDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setIsFollowing(response.data.isFollowed);
    } catch (e: any) {
      console.error("Fetch Event Details Error:", e.response?.data || e.message);
      if (e.response?.status !== 401) {
         Alert.alert("Error", "Failed to load event details.");
      }
      if (e.response?.status === 404) {
          router.back();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const onSaveToggle = async () => {
    if (isSaving || !event) return;
    setIsSaving(true);
    const wasSaved = event.isSaved;
    setEvent(prev => prev ? { ...prev, isSaved: !wasSaved } : null);

    try {
      if (wasSaved) {
        await api.delete(`/events/${event.id}/unsave`);
      } else {
        await api.post(`/events/${event.id}/save`);
      }
    } catch (e: any) {
      console.error("Save Toggle Error:", e.response?.data || e.message);
       if (e.response?.status !== 401) {
         Alert.alert("Error", "Could not update save status.");
       }
       setEvent(prev => prev ? { ...prev, isSaved: wasSaved } : null);
    } finally {
      setIsSaving(false);
    }
  };

  const onRegister = () => {
    if (event?.isRegistered || isRegistering) return;
    Alert.alert(
      "Confirm Registration",
      `Register for "${event?.title}"?\n\nYour details (${user?.name}, ${user?.email}) will be sent.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm & Register", onPress: confirmRegistration }
      ]
    );
  };

  const confirmRegistration = async () => {
    if (isRegistering || !event) return;
    setIsRegistering(true);

    try {
      await api.post(`/events/${event.id}/register`);
      setEvent(prev => prev ? { ...prev, isRegistered: true } : null);
      Alert.alert("Success", "You have been registered for the event!");
    } catch (e: any) {
      console.error("Registration Error:", e.response?.data || e.message);
      if (e.response?.status !== 401) {
         Alert.alert("Error", e.response?.data?.message || "Could not register for the event.");
      }
    } finally {
      setIsRegistering(false);
    }
  };
  
  const isOwner = user?.id === event?.postedById;
  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN');

  const onDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete }
      ]
    );
  };
  
  const confirmDelete = async () => {
     if (!event) return;
     try {
       await api.delete(`/events/${event.id}`);
       Alert.alert("Success", "Event deleted.");
       router.replace('/(tabs)');
     } catch (e: any) {
        console.error("Delete Error:", e.response?.data);
        Alert.alert("Error", e.response?.data?.message || "Could not delete event.");
     }
  };
  
  const onEdit = () => {
    if (!event) return;
    router.push(`/edit-event/${event.id}`);
  };

  const onFollowToggle = async () => {
     if (isFollowLoading || !event) return;
     setIsFollowLoading(true);
     const wasFollowed = isFollowing;
     setIsFollowing(!wasFollowed);
     
     try {
        if (wasFollowed) {
          await api.delete(`/follow/${event.clubId}`);
        } else {
          await api.post(`/follow/${event.clubId}`);
        }
     } catch (e: any) {
        setIsFollowing(wasFollowed);
        Alert.alert("Error", e.response?.data?.message || "Could not follow club.");
     } finally {
        setIsFollowLoading(false);
     }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  if (!event) {
     return (
       <SafeAreaView style={styles.center}>
         <Text>Event not found or failed to load.</Text>
       </SafeAreaView>
     );
  }

  const hasImages = event.imageUrls && event.imageUrls.length > 0;
  const logoUrl = event?.clubLogoUrl ? `${API_HOST_URL}${event.clubLogoUrl}` : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        {(isOwner || isSuperAdmin) && (
          <View style={styles.ownerActions}>
            <Pressable onPress={onEdit} style={styles.headerButton}>
              <MaterialIcons name="edit" size={24} color="#007bff" />
            </Pressable>
            <Pressable onPress={onDelete} style={styles.headerButton}>
              <MaterialIcons name="delete" size={24} color="#dc3545" />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView>
        <View style={styles.cardHeader}>
          <View style={styles.clubInfo}>
             {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.clubLogo} />
             ) : (
                <View style={styles.clubLogo} />
             )}
            <Text style={styles.clubName}>{event.clubName}</Text>
          </View>
          <Pressable 
            style={[styles.followButton, isFollowing ? styles.followingButton : {}]}
            onPress={onFollowToggle}
            disabled={isFollowLoading}
          >
            <Text style={[styles.followButtonText, isFollowing ? styles.followingButtonText : {}]}>
              {isFollowLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.eventMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.metaText}>{event.eventDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.metaText}>{event.eventTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.metaText}>{event.location || "N/A"}</Text>
          </View>
        </View>

        {hasImages && (
          <ScrollView style={styles.imageScrollContainer}>
            {event.imageUrls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: `${API_HOST_URL}${url}` }}
                style={styles.eventImage}
              />
            ))}
          </ScrollView>
        )}
        
        <Text style={styles.description}>{event.description}</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={isRegistering || event.isRegistered ? styles.registerButtonDisabled : styles.registerButton}
          onPress={onRegister}
          disabled={event.isRegistered || isRegistering}
        >
          <Text style={styles.registerButtonText}>
            {isRegistering ? "Registering..." : event.isRegistered ? "Registered" : "One Tap Register"}
          </Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={onSaveToggle} disabled={isSaving}>
          <Ionicons
            name={event.isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color="#007bff"
          />
          <Text style={styles.saveButtonText}>
            {isSaving ? "..." : event.isSaved ? "Saved" : "Save"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: '#eee', backgroundColor: '#fff',
  },
  headerButton: { padding: 6 },
  ownerActions: { flexDirection: 'row' },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16,
  },
  clubInfo: { flexDirection: 'row', alignItems: 'center' },
  clubLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  clubName: { fontWeight: 'bold', fontSize: 16 },
  followButton: {
    borderColor: '#007bff', borderWidth: 1.5, paddingVertical: 6,
    paddingHorizontal: 16, borderRadius: 20, minWidth: 90, alignItems: 'center',
  },
  followingButton: { backgroundColor: '#007bff' },
  followButtonText: { color: '#007bff', fontWeight: 'bold' },
  followingButtonText: { color: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  eventMetaRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  metaText: { fontSize: 14, color: '#555', marginLeft: 6 },
  imageScrollContainer: { marginBottom: 16 },
  eventImage: { width: width, height: 350, resizeMode: 'cover', marginBottom: 5 },
  description: { fontSize: 16, color: '#333', paddingHorizontal: 16, lineHeight: 24, paddingBottom: 100 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', alignItems: 'center'
  },
  registerButton: {
    flex: 1, backgroundColor: '#007bff', padding: 14, borderRadius: 25,
    alignItems: 'center', marginRight: 10,
  },
  registerButtonDisabled: {
    flex: 1, backgroundColor: '#a0cfff', padding: 14, borderRadius: 25,
    alignItems: 'center', marginRight: 10,
  },
  registerButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  saveButton: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  saveButtonText: { color: '#007bff', fontWeight: 'bold', fontSize: 16, marginLeft: 6 },
});