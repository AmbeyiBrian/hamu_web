import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useShops, Shop } from '../hooks/useShops';

export type TimeRangeType = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface FilterContextType {
  shopId: string;
  setShopId: (id: string) => void;
  timeRange: TimeRangeType;
  setTimeRange: (range: TimeRangeType) => void;
  shops: Shop[];
  isLoading: boolean;
}

// Create the context with default values
const FilterContext = createContext<FilterContextType>({
  shopId: 'all',
  setShopId: () => {},
  timeRange: 'month',
  setTimeRange: () => {},
  shops: [],
  isLoading: false
});

// Custom hook to use the filter context
export const useFilters = () => useContext(FilterContext);

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [shopId, setShopId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('month');
  
  // Fetch shops data using the existing hook
  const { 
    data: shops = [], 
    isLoading 
  } = useShops();

  // The value that will be provided to consumers
  const value = {
    shopId,
    setShopId,
    timeRange,
    setTimeRange,
    shops,
    isLoading
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};