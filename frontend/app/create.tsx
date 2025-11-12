import { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, Pressable,
  Image, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { api } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateEventScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [clubName, setClubName] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (selectedDate: Date) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages(prevImages => [...prevImages, ...result.assets]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImages(prevImages => prevImages.filter(img => img.uri !== uriToRemove));
  };

  const handleSubmit = async () => {
    if (!title || !description || !date || !clubName) {
      Alert.alert("Missing Fields", "Please fill in Title, Description, Date, and Club Name.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    const eventData = {
      title, description, location,
      club: { name: clubName },
      eventDate: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      eventTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    formData.append('event', JSON.stringify(eventData));

    if (images.length > 0) {
      images.forEach((image) => {
        const file = {
          uri: image.uri,
          name: image.fileName || `image_${Date.now()}.jpg`,
          type: image.mimeType ?? 'image/jpeg',
        } as any;
        formData.append('files', file);
      });
    }

    try {
      await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert("Success", "Event created successfully!");
      router.back();

    } catch (e: any) {
      console.error("Create Event Error:", JSON.stringify(e.response?.data || e.message, null, 2));
      Alert.alert("Error", "Failed to create event. " + (e.response?.data?.message || "Check backend logs."));
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        // --- THIS IS THE FIX ---
        date={date || new Date()} 
      />
      <View style={styles.header}>
         <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Create New Event</Text>
        <View style={{width: 24}}/>{/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Introduction to Python" />

        <Text style={styles.label}>Club Name *</Text>
        <TextInput style={styles.input} value={clubName} onChangeText={setClubName} placeholder="TinkerHub CET" />

        <Text style={styles.label}>Event Description *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="About the event..." multiline />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Offline / Auditorium / Online Link" />

        <Text style={styles.label}>Date & Time *</Text>
        <Pressable style={styles.datePickerButton} onPress={showDatePicker}>
          <Ionicons name="calendar" size={20} color="#007bff" />
          <Text style={styles.datePickerText}>
            {date ? date.toLocaleString() : "Select Date and Time"}
          </Text>
        </Pressable>

        <Text style={styles.label}>Images</Text>
        <Pressable style={styles.imagePickerButton} onPress={pickImages}>
          <Ionicons name="image" size={20} color="#007bff" />
          <Text style={styles.datePickerText}>Add Images</Text>
        </Pressable>

        <ScrollView horizontal style={styles.imagePreviewContainer}>
          {images.map(image => (
            <View key={image.uri} style={styles.thumbnailContainer}>
              <Image source={{ uri: image.uri }} style={styles.thumbnail} />
              <Pressable style={styles.removeImageButton} onPress={() => removeImage(image.uri)}>
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
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Event</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Same as before) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd', borderWidth: 1, borderRadius: 8,
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
  thumbnail: { width: 100, height: 100, borderRadius: 8 },
  removeImageButton: {
     position: 'absolute', top: 2, right: 2,
     backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 1,
  },
  submitButton: { backgroundColor: '#007bff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonDisabled: { backgroundColor: '#a0cfff', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});