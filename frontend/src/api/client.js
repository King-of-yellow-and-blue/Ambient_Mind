import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Determine the API base URL dynamically (called per-request, not at load time).
 * This ensures Capacitor's bridge is initialized before we check.
 */
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // Check if running inside Capacitor (Android app)
  // window.Capacitor is injected by the native shell
  const isNative = typeof window !== 'undefined' && 
    window.Capacitor && 
    window.Capacitor.isNativePlatform && 
    window.Capacitor.isNativePlatform();
  
  if (isNative) {
    // Use the PC's LAN IP so the phone can reach the backend
    return 'http://10.27.130.8:8000';
  }
  return 'http://localhost:8000';
};

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000, // 15s timeout for mobile networks
});

// Dynamically set baseURL on EVERY request (not at creation time)
apiClient.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getBaseURL();
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      toast.error('Cannot reach server. Make sure you are on the same network.');
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user-storage');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    } else if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail[0].msg || 'Validation Error');
      } else {
        toast.error('An error occurred');
      }
    } else {
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);
