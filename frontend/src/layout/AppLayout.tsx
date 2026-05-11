import { useMemo, useState, type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupsIcon from '@mui/icons-material/Groups';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

const drawerWidth = 240;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const initials = useMemo(() => {
    if (!user?.email) return '?';
    const p = user.email.split('@')[0] ?? '';
    return (p[0] ?? '?').toUpperCase();
  }, [user?.email]);

  const items = useMemo(() => {
    const all: { label: string; icon: ReactElement; to: string }[] = [
      { label: 'Dashboard', icon: <DashboardIcon />, to: '/' },
    ];
    if (user?.role === 'superAdmin') {
      all.push({
        label: 'Hospitals',
        icon: <LocalHospitalIcon />,
        to: '/hospitals',
      });
    }
    if (user?.role === 'hospitalAdmin') {
      all.push(
        { label: 'Patients', icon: <GroupsIcon />, to: '/patients' },
        { label: 'Doctors', icon: <MedicalServicesIcon />, to: '/doctors' },
      );
    }
    return all;
  }, [user?.role]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" noWrap component="div">
              {user?.role === 'hospitalAdmin' && user?.hospitalSubdomain
                ? `${user.hospitalSubdomain} — Hospital`
                : 'Multitenancy'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {user?.role ?? 'user'}
            </Typography>
          </Box>

          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ width: 34, height: 34 }}>{initials}</Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>{user?.email ?? '—'}</MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                logout();
                navigate('/login');
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {items.map((it) => (
              <ListItemButton
                key={it.to}
                selected={
                  it.to === '/'
                    ? location.pathname === '/'
                    : location.pathname === it.to ||
                      location.pathname.startsWith(`${it.to}/`)
                }
                onClick={() => navigate(it.to)}
              >
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            <ListItemButton
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

