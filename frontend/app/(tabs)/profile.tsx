import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Pressable, ScrollView, 
  ActivityIndicator, Alert, Image, RefreshControl, FlatList
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { api, API_HOST_URL } from '../../constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  yearOfStudy: string;
  interests: string[];
  profilePictureUrl: string | null;
};

type AdminEventStat = {
  id: number;
  title: string;
  eventDate: string;
  registrationCount: number;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestingAdmin, setRequestingAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminEvents, setAdminEvents] = useState<AdminEventStat[]>([]);

  const isUserAdmin = user?.roles.includes('ROLE_ADMIN') || user?.roles.includes('ROLE_SUPER_ADMIN');
  const isSuperAdmin = user?.roles.includes('ROLE_SUPER_ADMIN');

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile(false);
      if (isUserAdmin) {
        fetchAdminEvents();
      }
    }, [isUserAdmin]) // Re-run if user role changes
  );

   const fetchProfile = async (showLoader = true) => {
     try {
       if (showLoader) setLoading(true);
       const response = await api.get('/users/me');
       setProfile(response.data);
     } catch (e: any) {
       console.error("Failed to load profile:", e.response?.data || e.message);
       if (e.response?.status !== 401 && !showLoader) { // Don't alert on simple focus-refreshes
          Alert.alert("Error", "Could not load your profile.");
       }
     } finally {
       setLoading(false);
     }
   };

   const fetchAdminEvents = async () => {
     try {
       const response = await api.get('/users/me/my-events');
       setAdminEvents(response.data);
     } catch (e: any) {
       console.error("Failed to load admin events:", e.response?.data || e.message);
     }
   };
  
   const onRefresh = async () => {
     setIsRefreshing(true);
     await fetchProfile(false); // Fetch without main loader
     setIsRefreshing(false);
   };

  const handleRequestAdmin = async () => {
     Alert.alert(
      "Request Admin Access?",
      "Submit a request to become a club leader/admin?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit Request", onPress: submitAdminRequest }
      ]
    );
  };

  const submitAdminRequest = async () => {
    setRequestingAdmin(true);
    try {
      const response = await api.post('/admin-requests');
      Alert.alert("Success", response.data.message);
    } catch (error: any) {
      console.error("Admin Request Error:", error.response?.data);
      Alert.alert("Error", error.response?.data?.message || "Could not submit request.");
    } finally {
      setRequestingAdmin(false);
    }
  };
  
  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll access to update your photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use correct enum
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploading(true);
    const formData = new FormData();
    const file = {
      uri: asset.uri,
      name: asset.fileName || `profile_${user?.id}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    } as any;
    formData.append('file', file);

    try {
      const response = await api.post('/users/me/picture', formData, {
         headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => prev ? {...prev, profilePictureUrl: response.data.message} : null);
    } catch (e: any) {
      console.error("Profile Pic Upload Error:", e.response?.data);
      Alert.alert("Error", e.response?.data?.message || "Could not upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const profilePicUrl = profile?.profilePictureUrl ? `${API_HOST_URL}${profile.profilePictureUrl}` : null;

  const renderAdminEventItem = ({ item }: { item: AdminEventStat }) => (
    <Pressable style={styles.statCard} onPress={() => router.push(`/event/${item.id}`)}>
      <View>
        <Text style={styles.statTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.statDate}>{item.eventDate}</Text>
      </View>
      <View style={styles.statCountBox}>
        <Text style={styles.statCount}>{item.registrationCount}</Text>
        <Text style={styles.statLabel}>Registrations</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.settingsButton} onPress={() => router.push('/edit-details')}>
        <Ionicons name="settings-outline" size={24} color="black" />
      </Pressable>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#007bff"/></View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View style={styles.content}>
                <View style={styles.avatarContainer}>
                  {isUploading ? (
                    <View style={styles.avatar}>
                      <ActivityIndicator size="large" />
                    </View>
                  ) : profilePicUrl ? (
                    <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={60} color="#888" />
                    </View>
                  )}
                  <Pressable style={styles.cameraButton} onPress={pickProfileImage} disabled={isUploading}>
                    <Ionicons name="camera" size={24} color="#333" />
                  </Pressable>
                </View>

                <Text style={styles.name}>{profile?.name || user?.name}</Text>
                <Text style={styles.email}>{profile?.email || user?.email}</Text>
                <View style={styles.infoRow}>
                  {profile?.yearOfStudy ? <Text style={styles.infoText}>{profile.yearOfStudy}</Text> : null}
                  {profile?.department ? <Text style={styles.infoText}>· {profile.department}</Text> : null}
                </View>

                <View style={styles.interestContainer}>
                  <Text style={styles.sectionTitle}>Your Interests</Text>
                  <View style={styles.interestTags}>
                    {(profile?.interests && profile.interests.length > 0) ? (
                      profile.interests.map((interest, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{interest}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noInterestsText}>Add interests via Edit Details.</Text>
                    )}
                  </View>
                </View>

                {isSuperAdmin && (
                   <Pressable
                    style={styles.dashboardButton}
                    onPress={() => router.push('/admin-dashboard')}
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color="white" style={{marginRight: 8}}/>
                    <Text style={styles.dashboardButtonText}>Admin Dashboard</Text>
                  </Pressable>
                )}

                {!isUserAdmin && (
                  <Pressable
                    style={requestingAdmin ? styles.requestButtonDisabled : styles.requestButton}
                    onPress={handleRequestAdmin}
                    disabled={requestingAdmin}
                  >
                    {requestingAdmin ? (
                      <ActivityIndicator color="#007bff" />
                     ) : (
                      <Text style={styles.requestButtonText}>Request Admin Access</Text>
                     )}
                  </Pressable>
                )}

                <Pressable style={styles.signOutButton} onPress={signOut}>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </Pressable>
              
                {/* --- NEW: Admin Stats Section --- */}
                {isUserAdmin && (
                  <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Your Event Stats</Text>
                  </View>
                )}
              </View>
            </>
          )}
          data={isUserAdmin ? adminEvents : []} // Only pass data if user is admin
          renderItem={renderAdminEventItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={isUserAdmin ? (
            <View style={{alignItems: 'center', paddingBottom: 40}}>
              <Text style={styles.noInterestsText}>You haven't posted any events yet.</Text>
            </View>
          ) : null}
          refreshControl={
             <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  settingsButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 5 },
  content: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  avatarContainer: { position: 'relative', marginBottom: 20 },
  avatar: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarImage: { width: 120, height: 120, borderRadius: 60 },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff',
    borderRadius: 20, padding: 8, elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2,
    borderWidth: 1, borderColor: '#eee',
  },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  email: { fontSize: 16, color: '#666', marginBottom: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 24 },
  infoText: { fontSize: 14, color: '#555', marginHorizontal: 5 },
  interestContainer: { width: '100%', marginBottom: 24, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#444', marginBottom: 12 },
  interestTags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tag: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#eee', borderRadius: 20, margin: 4, flexDirection: 'row', alignItems: 'center' },
  tagText: { color: '#555' },
  noInterestsText: { color: '#888', fontStyle: 'italic', marginTop: 5 },
  dashboardButton: {
    backgroundColor: '#6f42c1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 25, paddingVertical: 12, paddingHorizontal: 30, marginBottom: 20, width: '80%', elevation: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
  },
  dashboardButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  requestButton: {
    borderColor: '#007bff', borderWidth: 1.5, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 30,
    marginBottom: 20, width: '80%', alignItems: 'center',
  },
  requestButtonDisabled: {
    borderColor: '#a0cfff', borderWidth: 1.5, borderRadius: 25, paddingVertical: 12, paddingHorizontal: 30,
    marginBottom: 20, width: '80%', alignItems: 'center',
  },
  requestButtonText: { color: '#007bff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  signOutButton: {
    marginTop: 10, backgroundColor: '#dc3545', paddingVertical: 14, paddingHorizontal: 60,
    borderRadius: 30, width: '70%', alignItems: 'center',
  },
  signOutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  statCard: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    maxWidth: '80%',
  },
  statDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  statCountBox: {
    alignItems: 'center',
    backgroundColor: '#e6f2ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  }
});