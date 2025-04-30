import React, { useEffect, useState } from 'react';
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
  useTheme,
  keyframes,
  styled
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle,
  Logout,
  Settings,
  Water as WaterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useFilters } from '../../context/FilterContext';
import NotificationButton from '../notifications/NotificationButton';
import SettingsMenu from '../settings/SettingsMenu';

// Define animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const subtlePulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0.8; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const StyledLogoImg = styled('img')(({ theme }) => ({
  width: 40,
  height: 40,
  marginRight: 12,
  transition: 'transform 0.3s ease',
  '&:hover': {
    animation: `${subtlePulse} 1.5s infinite ease-in-out`,
  }
}));

const AnimatedAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 15s ease infinite`,
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }
}));

interface HeaderProps {
  onToggleSidebar?: () => void;
}

// Animated water icon component
const AnimatedWaterIcon = styled(WaterIcon)(({ theme }) => ({
  color: alpha('#fff', 0.8),
  animation: `${float} 3s ease-in-out infinite, ${rotate} 7s linear infinite`,
  marginRight: theme.spacing(1),
  fontSize: '1.2rem'
}));

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { shopId, setShopId, shops, isLoading } = useFilters();
  const theme = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
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
    <AnimatedAppBar
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: 'white',
      }}
    >
      <Toolbar sx={{ opacity: mounted ? 1 : 0, animation: mounted ? `${fadeIn} 0.5s ease-out` : 'none' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ 
            mr: 2, 
            display: { sm: 'none' },
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'rotate(180deg)'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          flexGrow: 1,
          '&:hover .header-title': {
            transform: 'translateX(5px)',
          }
        }}>
          <StyledLogoImg
            src={require('../../assets/icons/icon.png')}
            alt="Business Logo"
          />          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnimatedWaterIcon />
            <Typography 
              variant="h6" 
              component="div" 
              className="header-title"
              sx={{ 
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: 'white',
                transition: 'transform 0.3s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Hamu Water Analytics
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>          <FormControl 
            sx={{ 
              minWidth: 180,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 2,
                opacity: 0,
                transition: 'opacity 0.5s ease',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
                top: 0,
                left: 0,
                pointerEvents: 'none'
              },
              '&:hover::after': {
                opacity: 1
              },
              '& .MuiInputBase-root': {
                backgroundColor: alpha('#fff', 0.1),
                borderRadius: 2,
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.15),
                  transform: 'translateY(-1px)'
                }
              },
              '& .MuiInputLabel-root': {
                color: alpha('#fff', 0.8),
                transition: 'transform 0.3s ease'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha('#fff', 0.25),
                transition: 'border-color 0.3s ease'
              },
              '& .MuiSvgIcon-root': {
                color: alpha('#fff', 0.8),
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)'
                }
              }
            }}
            size="small"
          >
            <InputLabel id="shop-select-label">Shop</InputLabel>          <Select
              labelId="shop-select-label"
              id="shop-select"
              value={shopId}
              label="Shop"
              onChange={handleShopChange}
              disabled={isLoading}
              sx={{
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
                }
              }}
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
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.2),
                    transform: 'scale(1.1)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.4)'
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
            />          </Box>
        </Box>
      </Toolbar>
    </AnimatedAppBar>
  );
};

export default Header;