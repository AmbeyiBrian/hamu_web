import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Badge,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle,
  Logout,
  Settings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useFilters } from '../../context/FilterContext';
import NotificationButton from '../notifications/NotificationButton';
import SettingsMenu from '../settings/SettingsMenu';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { shopId, setShopId, shops, isLoading } = useFilters();
  const theme = useTheme();
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleShopChange = (event: SelectChangeEvent) => {
    setShopId(event.target.value);
  };
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    setAnchorEl(null);
  };

  const handleSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettingsMenu = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: 'white' // Fixed: Explicitly setting text color to white
          }}
        >
          Hamu Water Analytics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl 
            sx={{ 
              minWidth: 180,
              '& .MuiInputBase-root': {
                backgroundColor: alpha('#fff', 0.1),
                borderRadius: 2,
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.15),
                }
              },
              '& .MuiInputLabel-root': {
                color: alpha('#fff', 0.8)
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha('#fff', 0.25)
              },
              '& .MuiSvgIcon-root': {
                color: alpha('#fff', 0.8)
              }
            }}
            size="small"
          >
            <InputLabel id="shop-select-label">Shop</InputLabel>
            <Select
              labelId="shop-select-label"
              id="shop-select"
              value={shopId}
              label="Shop"
              onChange={handleShopChange}
              disabled={isLoading}
            >
              <MenuItem value="all">All Shops</MenuItem>
              {isLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading...
                </MenuItem>
              ) : (
                shops.map((shop) => (
                  <MenuItem key={shop.id} value={shop.id.toString()}>
                    {shop.shopName}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* <NotificationButton /> */}

          <Box>
            <Tooltip title="Account settings">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleSettingsMenu}
                color="inherit"
                sx={{ 
                  backgroundColor: alpha('#fff', 0.1),
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.2),
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
            
            <SettingsMenu 
              anchorEl={settingsAnchorEl}
              open={Boolean(settingsAnchorEl)}
              onClose={handleCloseSettingsMenu}
              onLogout={handleLogout}
            />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;