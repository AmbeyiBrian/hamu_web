import axios from 'axios';
import { API_URL } from './apiConfig';

// Types for analytics data
export interface SalesSummary {
  total_revenue: number;
  refill_revenue: number;
  bottle_sales_revenue: number;
  period: string;
  sales_by_payment_mode: {
    MPESA: number;
    CASH: number;
    CREDIT: number;
  };
  sales_by_shop: Record<string, number>;
}

export interface CustomerSummary {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  loyalty_redemptions: number;
  avg_time_between_refills: number;
  credits_outstanding: number;
}

export interface InventorySummary {
  stock_by_item: Record<string, number>;
  stock_turnover_rate: Record<string, number>;
  water_consumption: number;
  predicted_depletion_dates: Record<string, string>;
}

export interface FinancialSummary {
  gross_profit: number;
  net_profit: number;
  expenses_by_category: Record<string, number>;
  profit_margin: number;
  cash_flow: {
    inflow: number;
    outflow: number;
    net: number;  };
}

// Create an axios instance for API calls
const API = axios.create({
  baseURL: API_URL + '/', // Ensure the baseURL ends with a trailing slash
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
API.interceptors.request.use(
  (config) => {
    // Get token from user object in localStorage
    const userStr = localStorage.getItem('user');
    let token = null;
    
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        token = userData.access;
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Analytics service methods
export const analyticsService = {
  // Get all shops
  getShops: async () => {
    try {
      const response = await API.get('shops/');
      return response.data;
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  },

  // Sales analytics
  getSalesAnalytics: async (timeRange = 'month', shopId = 'all') => {
    try {
      console.log(`Fetching sales analytics with shopId: ${shopId}`);
      const response = await API.get('analytics/sales/', {
        params: { time_range: timeRange, shop_id: shopId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  },

  // Customer analytics
  getCustomerAnalytics: async (shopId = 'all') => {
    try {
      console.log(`Fetching customer analytics with shopId: ${shopId}`);
      const response = await API.get('analytics/customers/', {
        params: { shop_id: shopId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      throw error;
    }
  },

  // Inventory analytics
  getInventoryAnalytics: async (shopId = 'all') => {
    try {
      console.log(`Fetching inventory analytics with shopId: ${shopId}`);
      const response = await API.get('analytics/inventory/', {
        params: { shop_id: shopId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  },

  // Financial analytics
  getFinancialAnalytics: async (timeRange = 'month', shopId = 'all') => {
    try {
      console.log(`Fetching financial analytics with shopId: ${shopId}`);
      const response = await API.get('analytics/financial/', {
        params: { time_range: timeRange, shop_id: shopId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw error;
    }
  }
};