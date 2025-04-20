import React from 'react';
import { Grid, Box, CircularProgress, Typography, Paper, styled, useTheme, alpha } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/analyticsService';
import StatCard from '../components/dashboard/StatCard';
import BarChartComponent from '../components/charts/BarChartComponent';
import LineChartComponent from '../components/charts/LineChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';
import {
  AttachMoney as RevenueIcon,
  People as CustomersIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon
} from '@mui/icons-material';
import { useFilters } from '../context/FilterContext';
import TimeRangeFilter from '../components/filters/TimeRangeFilter';
import { useShops, Shop } from '../hooks/useShops';

// Define data interfaces
interface SalesData {
  total_revenue: number;
  total_sales_count: number;
  sales_by_payment_mode: Record<string, number>;
  sales_by_shop: Record<string, number>;
  daily_sales: Array<{ date: string; revenue: number }>;
  revenue_change_percentage?: number;
  sales_count_change_percentage?: number;
}

interface CustomerData {
  active_customers: number;
  active_customers_change_percentage?: number;
  top_customers: Array<TopCustomer>;
}

interface TopCustomer {
  id: number;
  name: string;
  phone: string;
  refills: number;
  total_spent: number;
}

interface InventoryData {
  low_stock_items: number;
  low_stock_items_change_percentage?: number;
}

interface FinancialData {
  // Add financial data properties as needed
}

// Create a custom Grid component to handle breakpoints in MUI v7
const ResponsiveGrid = ({ 
  xs, 
  sm, 
  md, 
  lg,
  children, 
  ...props 
}: { 
  xs?: number,
  sm?: number,
  md?: number,
  lg?: number,
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof Grid>, 'xs' | 'sm' | 'md' | 'lg'>) => {
  
  // Convert the old breakpoint props to the new sx format
  const breakpointStyles = {
    gridColumn: {
      xs: xs ? `span ${xs}` : undefined,
      sm: sm ? `span ${sm}` : undefined,
      md: md ? `span ${md}` : undefined,
      lg: lg ? `span ${lg}` : undefined,
    }
  };
  
  return (
    <Grid sx={breakpointStyles} {...props}>
      {children}
    </Grid>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  // Use centralized filters instead of local state
  const { shopId, timeRange } = useFilters();
  
  // Fetch shops data
  const { 
    data: shopsData = [],
    isLoading: shopsLoading,
    error: shopsError
  } = useShops();
  
  // Fetch sales analytics data
  const { 
    data: salesData = {
      total_revenue: 0,
      total_sales_count: 0,
      sales_by_payment_mode: {},
      sales_by_shop: {},
      daily_sales: [],
      revenue_change_percentage: 0,
      sales_count_change_percentage: 0
    } as SalesData,
    isLoading: salesLoading,
    error: salesError
  } = useQuery({
    queryKey: ['salesAnalytics', timeRange, shopId],
    queryFn: () => analyticsService.getSalesAnalytics(timeRange, shopId),
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Fetch customer analytics data
  const { 
    data: customerData = {
      active_customers: 0,
      active_customers_change_percentage: 0,
      top_customers: []
    } as CustomerData,
    isLoading: customerLoading,
    error: customerError
  } = useQuery({
    queryKey: ['customerAnalytics', shopId],
    queryFn: () => analyticsService.getCustomerAnalytics(shopId),
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Fetch inventory analytics data
  const { 
    data: inventoryData = {
      low_stock_items: 0,
      low_stock_items_change_percentage: 0
    } as InventoryData,
    isLoading: inventoryLoading,
    error: inventoryError
  } = useQuery({
    queryKey: ['inventoryAnalytics', shopId],
    queryFn: () => analyticsService.getInventoryAnalytics(shopId),
    staleTime: 60 * 1000 // 1 minute
  });
  
  // Fetch financial analytics data
  const { 
    data: financialData = {},
    isLoading: financialLoading,
    error: financialError
  } = useQuery({
    queryKey: ['financialAnalytics', timeRange, shopId],
    queryFn: () => analyticsService.getFinancialAnalytics(timeRange, shopId),
    staleTime: 60 * 1000 // 1 minute
  });
  
  const isLoading = salesLoading || customerLoading || inventoryLoading || financialLoading || shopsLoading;
  const hasError = salesError || customerError || inventoryError || financialError || shopsError;
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }
  
  if (hasError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="error">
          Error loading dashboard data. Please try again later.
        </Typography>
      </Box>
    );
  }
  
  // Prepare data for charts
  const salesByPaymentMode = salesData ? Object.entries(salesData.sales_by_payment_mode).map(([mode, amount], index) => {
    // Assign distinct colors to each payment mode
    const paymentModeColors = {
      'MPESA': '#0077B6', // Ocean blue
      'CASH': '#2a9d8f',  // Teal
      'CREDIT': '#fb8500'  // Orange
    };
    
    return {
      name: mode,
      value: amount as number,
      color: (paymentModeColors as any)[mode] || theme.palette.primary.main
    };
  }) : [];
  
  const salesTrend = salesData ? salesData.daily_sales : [];
  
  const revenueByShop = salesData ? Object.entries(salesData.sales_by_shop).map(([shop, amount]) => ({
    shop,
    revenue: amount
  })) : [];
  
  const topCustomers = customerData ? customerData.top_customers.slice(0, 5) : [];
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <TimeRangeFilter />
      </Box>

      {/* Row 1: Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={salesData?.total_revenue || 0}
            icon={<RevenueIcon />}
            percentChange={salesData?.revenue_change_percentage}
            iconColor="#0077B6" // Ocean blue
            valuePrefix="KES "
          />
        </ResponsiveGrid>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value={salesData?.total_sales_count || 0}
            icon={<SalesIcon />}
            percentChange={salesData?.sales_count_change_percentage}
            iconColor="#00B4D8" // Lighter blue
          />
        </ResponsiveGrid>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Active Customers"
            value={customerData?.active_customers || 0}
            icon={<CustomersIcon />}
            percentChange={customerData?.active_customers_change_percentage}
            iconColor="#48CAE4" // Sky blue
          />
        </ResponsiveGrid>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={inventoryData?.low_stock_items || 0}
            icon={<InventoryIcon />}
            percentChange={inventoryData?.low_stock_items_change_percentage}
            iconColor="#0096C7" // Deep sky blue
          />
        </ResponsiveGrid>
      </Grid>

      {/* Row 2: All Charts in one row */}
      <Grid container spacing={3}>
        {/* Revenue Trend Chart */}
        <ResponsiveGrid xs={12} md={6} lg={3}>
          <LineChartComponent 
            title="Revenue Trend"
            data={salesTrend}
            lines={[{ dataKey: 'revenue', color: theme.palette.primary.main, name: 'Revenue' }]}
            xAxisDataKey="date"
            valuePrefix="KES "
            height={260}
          />
        </ResponsiveGrid>
        
        {/* Revenue by Shop */}
        <ResponsiveGrid xs={12} md={6} lg={3}>
          <BarChartComponent 
            title="Revenue by Shop"
            data={revenueByShop}
            dataKey="revenue"
            xAxisDataKey="shop"
            valuePrefix="KES "
            height={260}
          />
        </ResponsiveGrid>
        
        {/* Sales by Payment Mode */}
        <ResponsiveGrid xs={12} md={6} lg={3}>
          <PieChartComponent 
            title="Sales by Payment Mode"
            data={salesByPaymentMode}
            valuePrefix="KES "
            height={260}
          />
        </ResponsiveGrid>
        
        {/* Top Customers */}
        <ResponsiveGrid xs={12} md={6} lg={3}>
          <Paper
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: theme.palette.text.primary 
              }}
            >
              Top Customers
            </Typography>
            <Box 
              component="table" 
              sx={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                flex: 1,
                overflowY: 'auto'
              }}
            >
              <Box component="thead">
                <Box component="tr" sx={{ borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                  <Box component="th" sx={{ py: 1, textAlign: 'left', color: theme.palette.text.secondary }}>Customer</Box>
                  <Box component="th" sx={{ py: 1, textAlign: 'right', color: theme.palette.text.secondary }}>Total</Box>
                </Box>
              </Box>
              <Box component="tbody">
                {topCustomers.map((customer: TopCustomer, index: number) => (
                  <Box 
                    component="tr" 
                    key={customer.id}
                    sx={{ 
                      '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.05)}`
                    }}
                  >
                    <Box component="td" sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="medium">{customer.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{customer.phone}</Typography>
                    </Box>
                    <Box component="td" align="right" sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="500">KES {customer.total_spent.toLocaleString()}</Typography>
                      <Typography variant="caption" color="text.secondary">{customer.refills} refills</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </ResponsiveGrid>
      </Grid>
    </Box>
  );
};

export default Dashboard;