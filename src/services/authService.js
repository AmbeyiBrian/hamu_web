import axios from 'axios';
import { API_URL } from '../api/apiConfig';

// Create a shared axios instance that can be imported and used across the app
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// For debugging - log all requests and responses
axiosInstance.interceptors.request.use(request => {
  console.log('Sending Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

axiosInstance.interceptors.response.use(
  response => {
    console.log('Response Success:', {
      status: response.status,
      url: response.config.url,
      headers: response.headers
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      headers: error.response?.headers,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

class AuthService {
  constructor() {
    // Initialize auth on construction
    this.setupAuth();
  }  // Login user and store tokens
  async login(username, password) {
    try {
      console.log('🔐 Login attempt with phone:', username);
      // Don't use the axiosInstance for login to avoid auth header issues
      const response = await axios.post(`${API_URL}/token/`, {
        phone_number: username,
        password
      });
      
      if (response.data.access) {
        console.log('🔐 Login successful, token received');
        
        // Important: Set the token in axios and axiosInstance headers FIRST
        // before any other API calls to prevent race conditions
        this.setAuthHeader(response.data.access);
        
        // Add a longer delay to ensure headers are fully applied
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fetch user profile data
        try {
          const userResponse = await axios.get(`${API_URL}/users/me/`, {
            headers: {
              'Authorization': `Bearer ${response.data.access}`
            }
          });
          
          // Store both auth tokens and user profile data
          const userData = {
            ...response.data,
            user: userResponse.data,
            loginTime: new Date().toISOString() // Add login timestamp
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User profile data stored:', userResponse.data);
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          // If we can't get the profile, still store the auth data
          localStorage.setItem('user', JSON.stringify({
            ...response.data,
            loginTime: new Date().toISOString()
          }));
        }
        
        // Double-check and reapply the auth header to ensure it's set
        this.setAuthHeader(response.data.access);
        
        // Extra debug - log the stored token
        console.log('Stored token in localStorage:', response.data.access.substring(0, 20) + '...');
        console.log('Headers after login:', {
          axiosInstance: axiosInstance.defaults.headers.common,
          axios: axios.defaults.headers.common
        });
      }
      
      // Wait a moment for everything to be properly set up before continuing
      await new Promise(resolve => setTimeout(resolve, 300));
      return response.data;
    } catch (error) {
      console.error('🔐 Login error:', error);
      throw error;
    }
  }

  // Set auth header for both axios instances
  setAuthHeader(token) {
    if (token) {
      // Set for global axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Set for our axiosInstance - use both formats to be safe
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
      
      console.log('🔐 Auth header set globally and for axiosInstance:', `Bearer ${token.substring(0, 15)}...`);
      console.log('Current headers:', {
        axios: axios.defaults.headers.common,
        axiosInstance: axiosInstance.defaults.headers.common
      });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      delete axiosInstance.defaults.headers.common['Authorization'];
      delete axiosInstance.defaults.headers.Authorization;
      console.log('🔐 Auth headers removed');
    }
  }

  // Logout user and remove tokens
  logout() {
    console.log('🔐 Logging out, removing token');
    localStorage.removeItem('user');
    this.setAuthHeader(null);
  }

  // Get current user info
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }

  // Get access token
  getAccessToken() {
    const user = this.getCurrentUser();
    return user?.access || "";
  }

  // Get refresh token
  getRefreshToken() {
    const user = this.getCurrentUser();
    return user?.refresh || "";
  }

  // Refresh the access token
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        console.warn('🔐 No refresh token available');
        this.logout();
        throw new Error('No refresh token available');
      }
      
      console.log('🔐 Attempting to refresh token');
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        console.log('🔐 Token refreshed successfully');
        const user = this.getCurrentUser();
        user.access = response.data.access;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update axios auth header with new token
        this.setAuthHeader(response.data.access);
      }
      
      return response.data;
    } catch (error) {
      console.error('🔐 Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    
    // Optionally decode and check token expiration
    // This is a simple check - for production, use a proper JWT decoder
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiryTime = payload.exp * 1000; // Convert from seconds to milliseconds
      
      if (Date.now() >= expiryTime) {
        console.warn('🔐 Token has expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('🔐 Error validating token:', error);
      return false;
    }
  }

  // Setup authentication from stored token on app init
  setupAuth() {
    const token = this.getAccessToken();
    if (token) {
      console.log('🔐 Setting up auth with stored token');
      this.setAuthHeader(token);
      
      // Check if token is valid by decoding it
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expiryTime = payload.exp * 1000; // Convert from seconds to milliseconds
          
          // If token is expired or about to expire (in 5 minutes), try to refresh it
          if (Date.now() >= expiryTime - 300000) { // 5 minutes before expiry
            console.log('🔐 Token is expired or about to expire, attempting to refresh');
            this.refreshToken().catch(err => {
              console.warn('Failed to refresh token during setup, redirecting to login:', err);
              this.logout();
              window.location.href = '/login';
            });
          }
        }
      } catch (error) {
        console.error('🔐 Error validating token during setup:', error);
      }
      
      return true;
    }
    console.warn('🔐 No token found during setup');
    return false;
  }
}

export default new AuthService();