import { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, Pressable, 
  Image, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { api, API_HOST_URL } from '../../constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type EventDetails = {
  id: number; title: string; description: string; eventDate: string;
  eventTime: string; location: string; clubId: number; clubName: string;
  clubLogoUrl: string | null; imageUrls: string[]; postedById: number;
  isFollowed: boolean;
};

const parseDateString = (dateStr: string | undefined): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
    }
  }
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) { return isoDate; }
  return undefined;
};


export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [clubName, setClubName] = useState('');
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${id}`);
        const event: EventDetails = response.data;
        
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.location || '');
        setClubName(event.clubName);
        setExistingImageUrls(event.imageUrls || []);
        setDate(parseDateString(event.eventDate));
        
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to load event data for editing.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selectedDate: Date) => { setDate(selectedDate); hideDatePicker(); };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      // --- FIX: Use MediaTypeOptions ---
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setNewImages(prevImages => [...prevImages, ...result.assets]);
    }
  };
  
  const removeNewImage = (uriToRemove: string) => {
    setNewImages(prevImages => prevImages.filter(img => img.uri !== uriToRemove));
  };
  const removeExistingImage = (urlToRemove: string) => {
     setExistingImageUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async () => {
    if (!title || !description || !date || !clubName) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    const eventData = {
      title, description, location,
      club: { name: clubName },
      eventDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      eventTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      imageUrls: existingImageUrls,
    };
    formData.append('event', JSON.stringify(eventData));

    if (newImages.length > 0) {
      newImages.forEach((image) => {
        const file = {
          uri: image.uri,
          name: image.fileName || `image_${Date.now()}.jpg`,
          type: image.mimeType ?? 'image/jpeg',
        } as any;
        formData.append('files', file);
      });
    }

    try {
      await api.put(`/events/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert("Success", "Event updated successfully!");
      router.back();
    } catch (e: any) {
      console.error("Update Event Error:", JSON.stringify(e.response?.data || e.message, null, 2));
      Alert.alert("Error", "Failed to update event. " + (e.response?.data?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#007bff" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        date={date || new Date()} // Provide default date
      />
      <View style={styles.header}>
         <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={{width: 24}}/>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        
        <Text style={styles.label}>Club Name *</Text>
        <TextInput style={styles.input} value={clubName} onChangeText={setClubName} />

        <Text style={styles.label}>Event Description *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline />
        
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} />
        
        <Text style={styles.label}>Date & Time *</Text>
        <Pressable style={styles.datePickerButton} onPress={showDatePicker}>
          <Ionicons name="calendar" size={20} color="#007bff" />
          <Text style={styles.datePickerText}>{date ? date.toLocaleString() : "Select Date and Time"}</Text>
        </Pressable>

        <Text style={styles.label}>Images</Text>
        <Pressable style={styles.imagePickerButton} onPress={pickImages}>
          <Ionicons name="image" size={20} color="#007bff" />
          <Text style={styles.datePickerText}>Add New Images</Text>
        </Pressable>
        
        <ScrollView horizontal style={styles.imagePreviewContainer}>
           {existingImageUrls.map((url, index) => (
             <View key={`existing-${index}`} style={styles.thumbnailContainer}>
                <Image source={{ uri: API_HOST_URL + url }} style={styles.thumbnail} />
                 <Pressable style={styles.removeImageButton} onPress={() => removeExistingImage(url)}>
                   <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.6)" />
                 </Pressable>
             </View>
           ))}
           {newImages.map(image => (
            <View key={image.uri} style={styles.thumbnailContainer}>
              <Image source={{ uri: image.uri }} style={styles.thumbnail} />
               <Pressable style={styles.removeImageButton} onPress={() => removeNewImage(image.uri)}>
                 <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.6)" />
              </Pressable>
            </View>
           ))}
        </ScrollView>
        

        <Pressable
          style={isSubmitting ? styles.submitButtonDisabled : styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Save Changes</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#f9f9f9', borderColor: '#ddd', borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginBottom: 20,
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  datePickerButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderColor: '#ddd', borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 20,
  },
  datePickerText: { fontSize: 16, color: '#007bff', marginLeft: 10 },
  imagePickerButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f2ff',
    borderColor: '#007bff', borderWidth: 1, borderStyle: 'dashed', borderRadius: 8,
    padding: 16, marginBottom: 10, justifyContent: 'center'
  },
  imagePreviewContainer: { flexDirection: 'row', marginBottom: 20, height: 110 },
  thumbnailContainer: { position: 'relative', marginRight: 8 },
  thumbnail: { width: 100, height: 100, borderRadius: 8, backgroundColor: '#eee' },
  removeImageButton: {
     position: 'absolute', top: 2, right: 2,
     backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 1,
  },
  submitButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonDisabled: { backgroundColor: '#9be0ad', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});