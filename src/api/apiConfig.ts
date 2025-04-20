import axios from 'axios';

// Create an axios instance with the base URL of your Django backend
const API = axios.create({
  baseURL: 'http://192.169.0.104:8000/api/', // Change this to match your Django API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;