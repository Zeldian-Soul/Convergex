import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  yearOfStudy: string;
  interests: string[];
};

export default function EditDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [interests, setInterests] = useState<string[]>([]); // Add state for interests

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      const profile: UserProfile = response.data;
      setName(profile.name || '');
      setPhoneNumber(profile.phoneNumber || '');
      setDepartment(profile.department || '');
      setYearOfStudy(profile.yearOfStudy || '');
      setInterests(profile.interests || []); // Load interests
    } catch (e: any) {
      console.error("Load Profile Error:", e.response?.data || e.message);
      if (e.response?.status !== 401) {
         Alert.alert("Error", "Could not load your profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSaveChanges = async () => {
     if (!name || !phoneNumber) {
         Alert.alert("Missing Fields", "Name and Phone Number are required.");
         return;
     }
    try {
      setSaving(true);
      const updatedProfile = {
        name,
        email: user?.email, // Email is not editable
        phoneNumber,
        department,
        yearOfStudy,
        interests, // Send updated interests
      };
      await api.put('/users/me', updatedProfile);
      Alert.alert("Success", "Your profile has been saved.");
      router.back(); // Go back after saving
    } catch (e: any) {
      console.error("Save Profile Error:", e.response?.data || e.message);
       if (e.response?.status !== 401) {
          Alert.alert("Error", "Could not save profile.");
       }
    } finally {
      setSaving(false);
    }
  };

  // Basic interest management (could be expanded)
  const [interestInput, setInterestInput] = useState('');
  const addInterest = () => {
      const newInterest = interestInput.trim();
      if (newInterest && !interests.includes(newInterest)) {
          setInterests([...interests, newInterest]);
          setInterestInput(''); // Clear input
      }
  };
  const removeInterest = (interestToRemove: string) => {
      setInterests(interests.filter(i => i !== interestToRemove));
  };

  if (loading) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#007bff" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Details</Text>
         <View style={{width: 24}}/>{/* Spacer */}
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" />

        <Text style={styles.label}>Email (college mail ID) *</Text>
        <TextInput style={styles.inputDisabled} value={user?.email || ''} editable={false} />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Your phone number" keyboardType="phone-pad" />

        <Text style={styles.label}>Department</Text>
        <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="e.g., Computer Science" />

        <Text style={styles.label}>Year of Study</Text>
        <TextInput style={styles.input} value={yearOfStudy} onChangeText={setYearOfStudy} placeholder="e.g., 4th Year" />

        {/* --- Interests Management --- */}
        <Text style={styles.label}>Interests</Text>
         <View style={styles.interestInputContainer}>
             <TextInput
                 style={styles.interestInput}
                 placeholder="Add an interest (e.g., Web Development)"
                 value={interestInput}
                 onChangeText={setInterestInput}
                 onSubmitEditing={addInterest} // Add interest on submit
             />
             <Pressable style={styles.addInterestButton} onPress={addInterest}>
                 <Ionicons name="add" size={24} color="#007bff" />
             </Pressable>
         </View>
        <View style={styles.interestTags}>
            {interests.map((interest, index) => (
                <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{interest}</Text>
                    <Pressable onPress={() => removeInterest(interest)} style={{marginLeft: 6}}>
                        <Ionicons name="close-circle" size={18} color="#888" />
                    </Pressable>
                </View>
            ))}
        </View>
        {/* --- End Interests --- */}


        <Pressable
          style={saving ? styles.buttonDisabled : styles.button}
          onPress={onSaveChanges}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' }, // Adjusted size
  form: { padding: 24, paddingBottom: 50 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: {
    height: 50, backgroundColor: '#f9f9f9', borderColor: '#ddd', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16,
  },
  inputDisabled: {
    height: 50, backgroundColor: '#eee', borderColor: '#ddd', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, color: '#888',
  },
   interestInputContainer: {
     flexDirection: 'row', alignItems: 'center', marginBottom: 10,
   },
   interestInput: {
      flex: 1, height: 50, backgroundColor: '#f9f9f9', borderColor: '#ddd', borderWidth: 1,
      borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginRight: 8,
   },
   addInterestButton: { padding: 10 },
   interestTags: {
      flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20,
   },
   tag: {
      flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12,
      backgroundColor: '#eee', borderRadius: 15, margin: 4,
   },
   tagText: { color: '#555', fontSize: 14 },
  button: {
    backgroundColor: '#28a745', height: 50, borderRadius: 8, justifyContent: 'center',
    alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9be0ad', height: 50, borderRadius: 8, justifyContent: 'center',
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});