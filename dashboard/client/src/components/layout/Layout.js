import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CssBaseline } from '@mui/material';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AlertDisplay from './AlertDisplay';

/**
 * Layout component
 * Main layout for the dashboard
 */
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector(state => state.auth);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Navbar */}
      <Navbar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        user={user}
      />
      
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        toggleSidebar={toggleSidebar}
      />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          overflow: 'auto',
          backgroundColor: theme => theme.palette.background.default
        }}
      >
        {/* Alert display */}
        <AlertDisplay />
        
        {/* Page content */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;