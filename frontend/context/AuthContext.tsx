import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../constants/api';

interface AuthContextType {
  token: string | null;
  user: { id: number; name: string; email: string; roles: string[] } | null; 
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (data: any) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- This will store the signOut function to be used by the interceptor ---
let globalSignOut: () => void = () => {};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUser = await AsyncStorage.getItem('userData');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, id, name, roles } = response.data;
      
      const userData = { id, name, email, roles };
      setUser(userData);
      setToken(token);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      return true;
    } catch (e: any) {
      console.error("Sign in failed", e.response?.data?.message || e.message);
      Alert.alert("Sign in failed", e.response?.data?.message || "Check credentials");
      return false;
    }
  };

  // --- REVERTED signUp FUNCTION ---
  const signUp = async (data: any) => {
    try {
      // Calls signup, but does NOT log the user in
      await api.post('/auth/signup', data);
      return true; // Indicate success
    } catch (e: any) {
      console.error("Sign up failed", e.response?.data?.message || e.message);
      Alert.alert("Sign up failed", e.response?.data?.message || "An error occurred during signup.");
      return false; // Indicate failure
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
       console.log("AuthContext: Signed out, token removed.");
    } catch (e) {
      console.error("Sign out failed", e);
    }
  };

  // --- Give the global variable access to signOut ---
  useEffect(() => {
    globalSignOut = signOut;
  }, []); // Run only once

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- ADD RESPONSE INTERCEPTOR for 401 ERRORS ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(`Interceptor: Response Error from ${error.config?.url}:`, error.response?.status, error.response?.data || error.message);
    
    // --- THIS IS THE KEY FIX ---
    if (error.response && error.response.status === 401) {
       // Only sign out if it's NOT a login/signup attempt that failed
       if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/signup')) {
            console.log("Interceptor: Received 401. Token is invalid or expired. Signing out.");
            globalSignOut(); // Call the global signOut function
       }
    }
    
    return Promise.reject(error);
  }
);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};