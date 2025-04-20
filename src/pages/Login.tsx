import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon 
} from '@mui/icons-material';
import authService from '../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import { AxiosError } from 'axios';

interface Credentials {
  username: string;
  password: string;
}

const Login = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const authData = await authService.login(credentials.username, credentials.password);
      console.log('Login successful, token received:', authData.access ? 'Yes' : 'No');
      
      // Navigate to the intended destination
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      // Type guard to check if error is an AxiosError
      if ((err as any).isAxiosError) {
        const axiosError = err as AxiosError<{ detail: string }>;
        setError(
          axiosError.response?.data?.detail || 
          'Login failed. Please check your credentials and try again.'
        );
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              HAMU Water
            </Typography>
            <Typography variant="h5" gutterBottom>
              Log In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to access the dashboard
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Phone Number"
              name="username"
              autoComplete="tel"
              autoFocus
              value={credentials.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;