import { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, Pressable,
    ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const onSignUpPressed = async () => {
    if (loading) return;

    if (!name || !email || !password || !phoneNumber) {
      Alert.alert("Missing Fields", "Please fill in all required fields (*).");
      return;
    }
    // ** REPLACE WITH YOUR DOMAIN **
    if (!email.endsWith('@tkmce.ac.in')) {
      Alert.alert("Invalid Email", "Only @tkmce.ac.in emails are allowed.");
      return;
    }
     if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const success = await signUp({
      name, email, password, phoneNumber, department, yearOfStudy,
    });
    setLoading(false);

    if (success) {
      // --- FIX: Navigate to Login on success ---
      Alert.alert("Success", "Account created successfully! Please log in.");
      router.replace('/login'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Get started with ConvergeX</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} placeholder="Your full name" value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Email (college mail ID) *</Text>
        <TextInput style={styles.input} placeholder="name@tkmce.ac.in" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput style={styles.input} placeholder="Your phone number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
        
        <Text style={styles.label}>Password *</Text>
        <TextInput style={styles.input} placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
        
        <Text style={styles.label}>Department</Text>
        <TextInput style={styles.input} placeholder="e.g., Computer Science" value={department} onChangeText={setDepartment} />
        
        <Text style={styles.label}>Year of Study</Text>
        <TextInput style={styles.input} placeholder="e.g., 4th Year" value={yearOfStudy} onChangeText={setYearOfStudy} />

        <Pressable
          style={loading ? styles.buttonDisabled : styles.button}
          onPress={onSignUpPressed}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </Pressable>

        {/* --- FIX: Add Link to login back --- */}
        <Link href="/login" asChild>
          <Pressable style={styles.linkButton}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log In</Text></Text>
          </Pressable>
        </Link>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (add link styles back) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { justifyContent: 'center', padding: 24, paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: {
    height: 50, backgroundColor: '#f9f9f9', borderColor: '#ddd', borderWidth: 1,
    borderRadius: 8, paddingHorizontal: 16, fontSize: 16, marginBottom: 16,
  },
  button: { backgroundColor: '#007bff', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#a0cfff', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#555' },
  linkBold: { fontWeight: 'bold', color: '#007bff' },
});