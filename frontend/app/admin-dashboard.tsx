import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { api } from '../constants/api';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type AdminRequest = {
  requestId: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
};

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchPendingRequests();
    }, [])
  );

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-requests/pending');
      setRequests(response.data);
    } catch (e: any) {
      console.error("Failed to fetch pending requests:", e.response?.data || e.message);
      if (e.response?.status !== 401) {
         Alert.alert("Error", "Could not load pending admin requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const response = await api.put(`/admin-requests/${requestId}/approve`);
      Alert.alert("Success", response.data.message);
      fetchPendingRequests(); // Refresh list
    } catch (e: any) {
      console.error("Approve failed:", e.response?.data);
       if (e.response?.status !== 401) {
          Alert.alert("Error", e.response?.data?.message || "Could not approve request.");
       }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const response = await api.put(`/admin-requests/${requestId}/reject`);
       Alert.alert("Success", response.data.message);
      fetchPendingRequests(); // Refresh list
    } catch (e: any) {
      console.error("Reject failed:", e.response?.data);
       if (e.response?.status !== 401) {
         Alert.alert("Error", e.response?.data?.message || "Could not reject request.");
       }
    } finally {
      setActionLoading(null);
    }
  };

  const renderRequestItem = ({ item }: { item: AdminRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.userEmail}>{item.userEmail}</Text>
        <Text style={styles.requestDate}>
          Requested: {new Date(item.requestedAt).toLocaleDateString()} at {new Date(item.requestedAt).toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.actions}>
        {actionLoading === item.requestId ? (
          <ActivityIndicator color="#007bff" style={styles.actionButton}/>
        ) : (
          <>
            <Pressable
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item.requestId)}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item.requestId)}
            >
              <Ionicons name="close-circle" size={24} color="white" />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Requests</Text>
         <View style={{width: 24}}/>{/* Spacer */}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.requestId.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No pending admin requests.</Text>
            </View>
          )}
           onRefresh={fetchPendingRequests} // Add pull-to-refresh
           refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 16 },
  emptyText: { fontSize: 16, color: '#888' },
  requestItem: {
    backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  userInfo: { flex: 1, paddingRight: 10 }, // Add paddingRight
  userName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#555', marginBottom: 4 },
  requestDate: { fontSize: 12, color: '#888' },
  actions: { flexDirection: 'row' },
  actionButton: {
    marginLeft: 10, padding: 8, borderRadius: 20, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  approveButton: { backgroundColor: '#28a745' },
  rejectButton: { backgroundColor: '#dc3545' },
});