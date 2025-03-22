import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Charts
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

// Redux actions
import { getProjects } from '../redux/slices/projectSlice';
import { getScanStatistics } from '../redux/slices/scanSlice';
import { 
  getVulnerabilityStatsByCategory,
  getVulnerabilityStatsBySeverity
} from '../redux/slices/vulnerabilitySlice';

// Custom components
import StatCard from '../components/dashboard/StatCard';

// Colors for charts
const COLORS = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];
const SEVERITY_COLORS = {
  critical: '#d32f2f',
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  info: '#2196f3'
};

/**
 * Dashboard page component
 * Main dashboard showing overview of vulnerabilities
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { projects, loading: projectsLoading } = useSelector(state => state.projects);
  const { statistics, loading: scanLoading } = useSelector(state => state.scans);
  const { 
    categoryStats, 
    severityStats,
    loading: vulnerabilityLoading 
  } = useSelector(state => state.vulnerabilities);
  
  // Loading state
  const loading = projectsLoading || scanLoading || vulnerabilityLoading;
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(getProjects());
    dispatch(getScanStatistics());
    dispatch(getVulnerabilityStatsByCategory());
    dispatch(getVulnerabilityStatsBySeverity());
  }, [dispatch]);
  
  // Prepare data for category chart
  const categoryChartData = categoryStats.map(stat => ({
    name: stat._id.split(' - ')[0],
    value: stat.count,
    fullName: stat._id
  }));
  
  // Prepare data for severity chart
  const severityChartData = severityStats.map(stat => ({
    name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
    value: stat.count,
    color: SEVERITY_COLORS[stat._id]
  }));
  
  // Prepare data for status chart
  const statusChartData = severityStats.map(stat => [
    { name: 'Open', value: stat.open, color: '#f44336' },
    { name: 'Fixed', value: stat.fixed, color: '#4caf50' },
    { name: 'False Positive', value: stat.falsePositive, color: '#ff9800' },
    { name: 'Ignored', value: stat.ignored, color: '#9e9e9e' }
  ]).flat();
  
  // Group status data by status
  const statusData = statusChartData.reduce((acc, item) => {
    const existingItem = acc.find(i => i.name === item.name);
    if (existingItem) {
      existingItem.value += item.value;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        <Button
          component={RouterLink}
          to="/projects/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Project
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Projects"
                value={projects.length}
                icon={<SecurityIcon fontSize="large" />}
                color="#2196f3"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Scans"
                value={statistics?.scanStats?.totalScans || 0}
                icon={<BugReportIcon fontSize="large" />}
                color="#4caf50"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Vulnerabilities"
                value={statistics?.scanStats?.totalVulnerabilities || 0}
                icon={<WarningIcon fontSize="large" />}
                color="#f44336"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg. Vulnerabilities"
                value={(statistics?.scanStats?.avgVulnerabilities || 0).toFixed(1)}
                icon={<BugReportIcon fontSize="large" />}
                color="#ff9800"
              />
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3}>
            {/* Category distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Vulnerabilities by Category
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => [value, props.payload.fullName]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Severity distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Vulnerabilities by Severity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {severityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Status distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Vulnerabilities by Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            {/* Recent projects */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Recent Projects
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {projects.length === 0 ? (
                  <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
                    No projects found. Create a new project to get started.
                  </Typography>
                ) : (
                  <Box>
                    {projects.slice(0, 5).map(project => (
                      <Card key={project._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6" component="div">
                            <Link component={RouterLink} to={`/projects/${project._id}`}>
                              {project.name}
                            </Link>
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {project.description || 'No description'}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {projects.length > 5 && (
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button
                          component={RouterLink}
                          to="/projects"
                          variant="outlined"
                        >
                          View All Projects
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;