import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as ProjectsIcon,
  BugReport as VulnerabilitiesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon
} from '@mui/icons-material';
import { selectRecentProjects } from '../../redux/slices/projectSlice';

// Sidebar width
const drawerWidth = 240;

/**
 * Sidebar component
 * Navigation sidebar for the dashboard
 */
const Sidebar = ({ open, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State to track expanded menu items
  const [expandedItems, setExpandedItems] = useState({
    projects: false
  });
  
  // Get recent projects from Redux store
  const recentProjects = useSelector(selectRecentProjects);
  
  // Navigation items
  const navItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      text: 'Vulnerabilities',
      icon: <VulnerabilitiesIcon />,
      path: '/vulnerabilities'
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports'
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings'
    }
  ];
  
  // Handle navigation item click
  const handleNavItemClick = (path) => {
    navigate(path);
  };
  
  // Toggle expanded state for menu items
  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };
  
  // Check if a navigation item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {/* Dashboard item */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavItemClick('/dashboard')}
              selected={isActive('/dashboard')}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
             
             
            </ListItemButton>
          </ListItem>
          
          
          
          {/* Other navigation items */}
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavItemClick(item.path)}
                selected={isActive(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;