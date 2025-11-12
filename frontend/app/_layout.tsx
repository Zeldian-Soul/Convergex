import React, { useEffect } from 'react';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Warning: [expo-image-picker] `ImagePicker.MediaTypeOptions`',
]);

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    const inTabsGroup = segments[0] === '(tabs)';

    const authenticatedRoutes = [
      'create', 'search', 'notifications', 'edit-details',
      'event', 'admin-dashboard', 'edit-event'
    ];
    
    const inAuthStackScreen = authenticatedRoutes.includes(segments[0]);
    // --- FIX: Check for login AND signup ---
    const inPublicAuthScreen = segments[0] === 'login' || segments[0] === 'signup';

    if (token) {
      // User is logged in
      if (!inTabsGroup && !inAuthStackScreen) {
        router.replace('/(tabs)');
      }
    } else {
      // User is not logged in
      if (!inPublicAuthScreen) {
        // --- FIX: Redirect to /login instead of /signup ---
        router.replace('/login');
      }
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" options={{ presentation: 'fullScreenModal' }}/>
      <Stack.Screen name="signup" options={{ presentation: 'fullScreenModal' }}/>
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-details" options={{ presentation: 'modal' }} />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="admin-dashboard" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit-event/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}