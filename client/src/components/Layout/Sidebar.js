import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard,
  Person,
  Description,
  Assessment,
  School,
  People,
  History,
  BarChart,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const applicantMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Application', icon: <Description />, path: '/application' },
    { text: 'Application Status', icon: <Assessment />, path: '/application-status' },
  ];

  const officerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/officer/dashboard' },
    { text: 'Applications', icon: <Description />, path: '/officer/applications' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Programmes', icon: <School />, path: '/admin/programmes' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'System Logs', icon: <History />, path: '/admin/logs' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
  ];

  const getMenuItems = () => {
    if (user?.role === 'admin') return adminMenuItems;
    if (user?.role === 'officer') return officerMenuItems;
    return applicantMenuItems;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
        },
      }}
    >
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

