import axios from 'axios';

// Create a centralized Axios instance
const apiClient = axios.create({
  // Use environment variable if available, fallback to localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the Auth Token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Ensure this only runs on the client side where window/localStorage exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (Token expired or invalid)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        // You could also dispatch a logout action to your store or redirect here
      }
    }
    
    // Format error message to be easily accessible by try/catch blocks
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
