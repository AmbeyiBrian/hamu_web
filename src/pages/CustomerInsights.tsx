import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Grid, 
  styled,
  CircularProgress
} from '@mui/material';
import {
  People as CustomersIcon,
  PersonAdd as NewCustomersIcon,
  Loyalty as LoyaltyIcon,
  CreditCard as CreditIcon
} from '@mui/icons-material';
import StatCard from '../components/dashboard/StatCard';
import LineChartComponent from '../components/charts/LineChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/analyticsService';
import { useFilters } from '../context/FilterContext';
import { useShops } from '../hooks/useShops';

// Create a styled Grid component for this page
const GridItem = styled(Grid)(({ theme }) => ({
  // Add any custom styling here if needed
}));

// Define a custom Grid component compatible with MUI v7
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

// Define types for our customer data
interface CustomerData {
  total_customers: number;
  active_customers: number;
  new_customers: number;
  credits_outstanding: number;
  customer_activity: Record<string, number>;
  customer_growth: Array<{month: string; count: number}>;
  avg_time_between_refills: number;
  loyalty_redemptions: number;
  loyalty_metrics: {
    eligible_for_free_refill: number;
    redeemed_this_month: number;
    average_refills_per_customer: number;
  };
  credit_analysis: {
    total_credit_given: number;
    total_repaid: number;
    credit_customers: number;
    avg_credit_per_customer: number;
  };
  top_customers: Array<TopCustomer>;
}

interface TopCustomer {
  id: number;
  name: string;
  phone: string;
  refills: number;
  purchases: number;  // Add missing purchases property
  total_spent: number;
  last_refill: string;
}

interface CustomerActivity {
  name: string;
  value: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerInsights: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Use centralized filter context instead of local state
  const { shopId } = useFilters();
  const { data: shopsData = [] } = useShops();
  
  // Fetch customer analytics data
  const { 
    data: customerData = {
      total_customers: 0,
      active_customers: 0,
      new_customers: 0,
      credits_outstanding: 0,
      customer_activity: {},
      customer_growth: [],
      avg_time_between_refills: 0,
      loyalty_redemptions: 0,
      loyalty_metrics: {
        eligible_for_free_refill: 0,
        redeemed_this_month: 0,
        average_refills_per_customer: 0
      },
      credit_analysis: {
        total_credit_given: 0,
        total_repaid: 0,
        credit_customers: 0,
        avg_credit_per_customer: 0
      },
      top_customers: []
    } as CustomerData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['customerAnalytics', shopId],
    queryFn: () => analyticsService.getCustomerAnalytics(shopId),
    staleTime: 60 * 1000, // 1 minute
  });

  // Format customer activity data for pie chart
  const customerActivityData: CustomerActivity[] = customerData && Object.entries(customerData.customer_activity).map(([status, count]) => ({
    name: status,
    value: count as number
  }));

  // Customer growth trend data
  const customerGrowthData = customerData?.customer_growth || [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading customer data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6" color="error">
          Error loading customer data. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Insights
        </Typography>
      </Box>

      {/* Key metrics row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={customerData.total_customers}
            icon={<CustomersIcon />}
            percentChange={6}
            iconColor="#4661d1"
          />
        </ResponsiveGrid>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Active Customers"
            value={customerData.active_customers}
            icon={<CustomersIcon />}
            percentChange={8}
            iconColor="#43a047"
            valueSuffix={` (${Math.round((customerData.active_customers / customerData.total_customers) * 100 || 0)}%)`}
          />
        </ResponsiveGrid>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="New Customers"
            value={customerData.new_customers}
            icon={<NewCustomersIcon />}
            percentChange={-3}
            iconColor="#ff9800"
            changeLabel="vs last month"
          />
        </ResponsiveGrid>
        <ResponsiveGrid xs={12} sm={6} md={3}>
          <StatCard
            title="Credit Outstanding"
            value={customerData.credits_outstanding}
            icon={<CreditIcon />}
            percentChange={12}
            iconColor="#e53935"
            valuePrefix="KES "
          />
        </ResponsiveGrid>
      </Grid>

      {/* Tabs for different customer views */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer insights tabs">
            <Tab label="Overview" />
            <Tab label="Loyalty Analysis" />
            <Tab label="Credit Analysis" />
            <Tab label="Top Customers" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <ResponsiveGrid xs={12} md={8}>
              <LineChartComponent
                title="Customer Growth"
                data={customerGrowthData}
                lines={[{ dataKey: 'customers', color: '#4661d1', name: 'Total Customers' }]}
                xAxisDataKey="month"
                height={300}
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12} md={4}>
              <PieChartComponent
                title="Customer Activity Status"
                data={customerActivityData || []}
                height={300}
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12}>
              <Paper
                elevation={0}
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Customer Behavior Insights
                </Typography>
                <Box sx={{ p: 1 }}>
                  <Typography variant="body1" paragraph>
                    Average time between refills: <strong>{customerData.avg_time_between_refills} days</strong>
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Loyalty program usage: <strong>{Math.round((customerData.loyalty_redemptions / customerData.active_customers * 100) || 0)}%</strong> of active customers redeemed free refills
                  </Typography>
                  <Typography variant="body1">
                    Customer retention rate: <strong>{Math.round((customerData.active_customers / customerData.total_customers * 100) || 0)}%</strong>
                  </Typography>
                </Box>
              </Paper>
            </ResponsiveGrid>
          </Grid>
        </TabPanel>
        
        {/* Loyalty Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <ResponsiveGrid xs={12} md={4}>
              <StatCard
                title="Eligible for Free Refill"
                value={customerData.loyalty_metrics.eligible_for_free_refill}
                icon={<LoyaltyIcon />}
                iconColor="#4661d1"
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12} md={4}>
              <StatCard
                title="Redemptions This Month"
                value={customerData.loyalty_metrics.redeemed_this_month}
                icon={<LoyaltyIcon />}
                iconColor="#43a047"
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12} md={4}>
              <StatCard
                title="Avg. Refills Per Customer"
                value={customerData.loyalty_metrics.average_refills_per_customer}
                icon={<LoyaltyIcon />}
                iconColor="#ff9800"
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12}>
              <Paper
                elevation={0}
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Loyalty Program Effectiveness
                </Typography>
                <Box sx={{ p: 1 }}>
                  <Typography variant="body1" paragraph>
                    Redemption rate: <strong>{Math.round((customerData.loyalty_metrics.redeemed_this_month / customerData.loyalty_metrics.eligible_for_free_refill * 100) || 0)}%</strong> of eligible customers redeemed their free refill
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Program participation: <strong>{Math.round((customerData.loyalty_metrics.eligible_for_free_refill / customerData.active_customers * 100) || 0)}%</strong> of active customers participate in the loyalty program
                  </Typography>
                  <Typography variant="body1">
                    Revenue impact: Approximately <strong>KES {(customerData.loyalty_metrics.redeemed_this_month * 200) || 0}</strong> in complimentary refills provided this month
                  </Typography>
                </Box>
              </Paper>
            </ResponsiveGrid>
          </Grid>
        </TabPanel>
        
        {/* Credit Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <ResponsiveGrid xs={12} md={6}>
              <StatCard
                title="Total Credit Given"
                value={customerData.credit_analysis.total_credit_given}
                icon={<CreditIcon />}
                iconColor="#4661d1"
                valuePrefix="KES "
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12} md={6}>
              <StatCard
                title="Total Credit Repaid"
                value={customerData.credit_analysis.total_repaid}
                icon={<CreditIcon />}
                iconColor="#43a047"
                valuePrefix="KES "
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12} md={6}>
              <StatCard
                title="Credit Customers"
                value={customerData.credit_analysis.credit_customers}
                icon={<CreditIcon />}
                iconColor="#ff9800"
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12} md={6}>
              <StatCard
                title="Avg. Credit Per Customer"
                value={customerData.credit_analysis.avg_credit_per_customer}
                icon={<CreditIcon />}
                iconColor="#e53935"
                valuePrefix="KES "
              />
            </ResponsiveGrid>
            <ResponsiveGrid xs={12}>
              <Paper
                elevation={0}
                sx={{ 
                  p: 2, 
                  height: '100%', 
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.12)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Credit System Performance
                </Typography>
                <Box sx={{ p: 1 }}>
                  <Typography variant="body1" paragraph>
                    Repayment rate: <strong>{Math.round((customerData.credit_analysis.total_repaid / customerData.credit_analysis.total_credit_given * 100) || 0)}%</strong> of total credit has been repaid
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Credit usage: <strong>{Math.round((customerData.credit_analysis.credit_customers / customerData.total_customers * 100) || 0)}%</strong> of customers use the credit system
                  </Typography>
                  <Typography variant="body1">
                    Outstanding balance: <strong>KES {(customerData.credit_analysis.total_credit_given - customerData.credit_analysis.total_repaid) || 0}</strong>
                  </Typography>
                </Box>
              </Paper>
            </ResponsiveGrid>
          </Grid>
        </TabPanel>
        
        {/* Top Customers Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell align="right">Refills</TableCell>
                  <TableCell align="right">Bottle Purchases</TableCell>
                  <TableCell align="right">Total Spent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerData.top_customers.map((customer: TopCustomer) => (
                  <TableRow
                    key={customer.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell align="right">{customer.refills}</TableCell>
                    <TableCell align="right">{customer.purchases}</TableCell>
                    <TableCell align="right">KES {customer.total_spent.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default CustomerInsights;