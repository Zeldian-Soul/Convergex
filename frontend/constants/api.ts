import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// =================================================================
// !! IMPORTANT !!
// Replace with your computer's IP address.
// =================================================================
export const API_HOST_URL = 'http://10.150.232.217:8080'; // <-- REPLACE IP
// =================================================================

// Create a global Axios instance
const api = axios.create({
  baseURL: `${API_HOST_URL}/api`, // Use the host URL
});

// Add a request interceptor to automatically add the JWT token to headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    console.log(`Interceptor: Making request to ${config.url}. Token from AsyncStorage: ${token ? "Found" : "Not Found"}`);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Interceptor: Added Auth header for ${config.url}`);
    } else {
        console.log(`Interceptor: No token found in AsyncStorage for ${config.url}`);
    }

    if (config.data instanceof FormData) {
      // Axios handles multipart/form-data headers automatically
    } else if (!config.headers['Content-Type']) {
       config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    console.error("Axios Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // console.log(`Interceptor: Response OK from ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(`Interceptor: Response Error from ${error.config?.url}:`, error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);


export { api };
