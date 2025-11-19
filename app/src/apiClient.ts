import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// THIS IS THE ONLY THING YOU NEED TO CHANGE - YOUR IP ADDRESS


const BASE_URL = 'http://192.168.0.117:50012/api'; // home

// const BASE_URL = 'http://192.168.31.42:50012/api';   //clinic

// const BASE_URL = 'http://147.93.104.55:50012/api';   //production

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add JWT token from AsyncStorage
apiClient.interceptors.request.use(
  async (config) => {
const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized! Token may be invalid.');
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;