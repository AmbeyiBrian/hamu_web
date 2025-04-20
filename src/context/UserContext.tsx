import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Define the User type
export interface User {
  id: string;
  names: string;
  email: string;
  phone_number: string;
  user_class: string;
  shop: string;
  is_active: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get user data from localStorage or API
  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get user data from localStorage first
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        // If not found in localStorage, fetch from API
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/users/me/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(response.data);
        } else {
          setUser(null);
        }
      } else {
        // Parse stored user data
        try {
          const userData = JSON.parse(storedUser);
          // If we have user data directly in the response
          if (userData.user) {
            setUser(userData.user);
          } else if (userData.access) {
            // If we only have tokens, fetch user profile
            const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/users/me/`, {
              headers: {
                'Authorization': `Bearer ${userData.access}`
              }
            });
            setUser(response.data);
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
          setError('Invalid user data');
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    refreshUserData();
  }, []);
  const value = {
    user,
    setUser,
    isLoading,
    error,
    refreshUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Export the context itself
export default UserContext;
