import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';

// Layout components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import NewProject from './pages/NewProject';
import ProjectDashboard from './pages/ProjectDashboard';
import Vulnerabilities from './pages/Vulnerabilities';
import ProjectVulnerabilities from './pages/ProjectVulnerabilities';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Redux actions
import { loadUser } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  // Load user on app load if token exists
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          !isAuthenticated ? <Login /> : <Navigate to="/dashboard" />
        } />
        <Route path="/register" element={
          !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
        } />
        {/* Private routes */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/project/:projectId" element={<ProjectDashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<NewProject />} />
          {/* Vulnerability routes */}
          <Route path="vulnerabilities" element={<Vulnerabilities />} />
          <Route path="vulnerabilities/project/:projectId" element={<ProjectVulnerabilities />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
}

export default App;