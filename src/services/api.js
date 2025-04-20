import axios from 'axios';
import authService, { axiosInstance } from './authService';

const API_URL = 'http://localhost:8000/api';

// Add request interceptor with detailed debugging to identify authentication issues
axiosInstance.interceptors.request.use(
  (config) => {
    // Get a fresh token each time to ensure we're using the latest
    const token = authService.getAccessToken();
    
    // Log detailed information about the request for debugging
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      // Ensure the Authorization header is set correctly
      // Using bracket notation to avoid case sensitivity issues
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`📤 Token applied: Bearer ${token.substring(0, 15)}...`);
    } else {
      console.warn('⚠️ No auth token available for request:', config.url);
    }
    
    // Log the final headers being sent
    console.log('📤 Final request headers:', JSON.stringify(config.headers));
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with detailed debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 Response ${response.status} from: ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error(`❌ Response error ${error.response?.status} from: ${error.config?.url}`);
    
    if (error.response) {
      console.error('❌ Error response data:', error.response.data);
      console.error('❌ Error response headers:', error.response.headers);
    }
    
    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        console.log('🔄 Attempting to refresh token...');
        // Try to refresh the token
        await authService.refreshToken();
        
        // Set the new token in the header
        const newToken = authService.getAccessToken();
        if (newToken) {
          console.log(`🔄 Token refreshed successfully. New token: ${newToken.substring(0, 15)}...`);
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          // Retry the original request with the new token
          return axiosInstance(error.config);
        } else {
          console.error('🔄 Token refresh failed: No new token returned');
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('🔄 Token refresh error:', refreshError);
        // If refresh fails, logout and redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Check for a token on initial load
const initialToken = authService.getAccessToken();
if (initialToken) {
  console.log('🔐 Initial API setup with token:', initialToken.substring(0, 15) + '...');
  // Ensure token is set on both common headers and direct headers for maximum compatibility
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
  axiosInstance.defaults.headers.Authorization = `Bearer ${initialToken}`;
} else {
  console.warn('⚠️ No token available on API service initialization');
}

// Custom method for direct API call with authorization
const callApiWithAuth = async (method, url, data = null, customHeaders = {}) => {
  const token = authService.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    url: url.startsWith('http') ? url : `${API_URL}${url}`,
    headers,
    ...(data && { data })
  };
  
  console.log(`🔄 Direct API call: ${method} ${url}`);
  console.log('🔄 Headers:', headers);
  
  try {
    const response = await axios(config);
    console.log(`🔄 Direct API response: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`🔄 Direct API error: ${error.response?.status}`);
    if (error.response?.status === 401) {
      console.error('🔄 Authentication error in direct API call');
    }
    throw error;
  }
};

// API services grouped by resource
const api = {
  // Direct API call function (for troubleshooting)
  callWithAuth: callApiWithAuth,

  // Authentication
  auth: {
    login: (phone_number, password) => 
      axios.post(`${API_URL}/token/`, { phone_number, password }),
    refreshToken: (refreshToken) => 
      axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken }),
    verifyToken: (token) => 
      axios.post(`${API_URL}/token/verify/`, { token }),
  },
  
  // Shops
  shops: {
    getAll: () => callApiWithAuth('get', '/shops/'),
    getById: (id) => callApiWithAuth('get', `/shops/${id}/`),
    create: (data) => callApiWithAuth('post', '/shops/', data),
    update: (id, data) => callApiWithAuth('put', `/shops/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/shops/${id}/`),
  },
  
  // Customers
  customers: {
    getAll: (params) => callApiWithAuth('get', '/customers/', null, { params }),
    getById: (id) => callApiWithAuth('get', `/customers/${id}/`),
    create: (data) => callApiWithAuth('post', '/customers/', data),
    update: (id, data) => callApiWithAuth('put', `/customers/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/customers/${id}/`),
  },
  
  // Packages
  packages: {
    getAll: () => callApiWithAuth('get', '/packages/'),
    getById: (id) => callApiWithAuth('get', `/packages/${id}/`),
    create: (data) => callApiWithAuth('post', '/packages/', data),
    update: (id, data) => callApiWithAuth('put', `/packages/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/packages/${id}/`),
  },
  
  // Refills
  refills: {
    getAll: (params) => callApiWithAuth('get', '/refills/', null, { params }),
    getById: (id) => callApiWithAuth('get', `/refills/${id}/`),
    create: (data) => callApiWithAuth('post', '/refills/', data),
    update: (id, data) => callApiWithAuth('put', `/refills/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/refills/${id}/`),
  },
  
  // Sales
  sales: {
    getAll: (params) => callApiWithAuth('get', '/sales/', null, { params }),
    getById: (id) => callApiWithAuth('get', `/sales/${id}/`),
    create: (data) => callApiWithAuth('post', '/sales/', data),
    update: (id, data) => callApiWithAuth('put', `/sales/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/sales/${id}/`),
  },
  
  // Credits
  credits: {
    getAll: (params) => callApiWithAuth('get', '/credits/', null, { params }),
    getById: (id) => callApiWithAuth('get', `/credits/${id}/`),
    create: (data) => callApiWithAuth('post', '/credits/', data),
    update: (id, data) => callApiWithAuth('put', `/credits/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/credits/${id}/`),
  },
  
  // Expenses
  expenses: {
    getAll: (params) => callApiWithAuth('get', '/expenses/', null, { params }),
    getById: (id) => callApiWithAuth('get', `/expenses/${id}/`),
    create: (data) => callApiWithAuth('post', '/expenses/', data),
    update: (id, data) => callApiWithAuth('put', `/expenses/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/expenses/${id}/`),
  },
  
  // Meter Readings
  meterReadings: {
    getAll: (params) => callApiWithAuth('get', '/meter-readings/', null, { params }),
    getById: (id) => callApiWithAuth('get', `/meter-readings/${id}/`),
    create: (data) => callApiWithAuth('post', '/meter-readings/', data),
    update: (id, data) => callApiWithAuth('put', `/meter-readings/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/meter-readings/${id}/`),
  },
  
  // Stock
  stock: {
    // Stock Items
    items: {
      getAll: (params) => callApiWithAuth('get', '/stock-items/', null, { params }),
      getById: (id) => callApiWithAuth('get', `/stock-items/${id}/`),
      create: (data) => callApiWithAuth('post', '/stock-items/', data),
      update: (id, data) => callApiWithAuth('put', `/stock-items/${id}/`, data),
      delete: (id) => callApiWithAuth('delete', `/stock-items/${id}/`),
    },
    // Stock Logs
    logs: {
      getAll: (params) => callApiWithAuth('get', '/stock-logs/', null, { params }),
      getById: (id) => callApiWithAuth('get', `/stock-logs/${id}/`),
      create: (data) => callApiWithAuth('post', '/stock-logs/', data),
      update: (id, data) => callApiWithAuth('put', `/stock-logs/${id}/`, data),
      delete: (id) => callApiWithAuth('delete', `/stock-logs/${id}/`),
    },
  },
  
  // SMS
  sms: {
    send: (data) => callApiWithAuth('post', '/sms/send/', data),
    sendToShopCustomers: (data) => callApiWithAuth('post', '/sms/send-to-shop/', data),
    sendToCreditCustomers: (data) => callApiWithAuth('post', '/sms/send-to-credit/', data),
    sendFreeRefillSms: (data) => callApiWithAuth('post', '/sms/send-free-refill/', data),
  },
  
  // Users
  users: {
    getAll: () => callApiWithAuth('get', '/users/'),
    getById: (id) => callApiWithAuth('get', `/users/${id}/`),
    create: (data) => callApiWithAuth('post', '/users/', data),
    update: (id, data) => callApiWithAuth('put', `/users/${id}/`, data),
    delete: (id) => callApiWithAuth('delete', `/users/${id}/`),
    changePassword: (id, data) => callApiWithAuth('post', `/users/${id}/change-password/`, data),
  },
  
  // Analytics
  analytics: {
    getSales: (params) => callApiWithAuth('get', '/analytics/sales/', null, { params }),
    getCustomers: (params) => callApiWithAuth('get', '/analytics/customers/', null, { params }),
    getInventory: (params) => callApiWithAuth('get', '/analytics/inventory/', null, { params }),
    getFinancial: (params) => callApiWithAuth('get', '/analytics/financial/', null, { params }),
  },
};

export default api;