import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  BugReport as BugReportIcon,
  Security as SecurityIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
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
import { getProjectById } from '../redux/slices/projectSlice';
import { getProjectScanStatistics } from '../redux/slices/scanSlice';
import {
  getProjectVulnerabilityStatsByCategory,
  getProjectVulnerabilityStatsBySeverity
} from '../redux/slices/vulnerabilitySlice';
import StatCard from '../components/dashboard/StatCard';
import EmptyChartState from '../components/dashboard/EmptyChartState';

// Colors for charts
const COLORS = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];
const SEVERITY_COLORS = {
  critical: '#d32f2f',
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
  info: '#2196f3'
};

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  // Get data from Redux store
  const { project, loading: projectLoading } = useSelector(state => state.projects);
  const { statistics, loading: scanLoading } = useSelector(state => state.scans);
  const {
    categoryStats,
    severityStats,
    loading: vulnLoading
  } = useSelector(state => state.vulnerabilities);

  // Loading state
  const loading = projectLoading || scanLoading || vulnLoading;

  // Check if any scan data exists
  const hasScanData = statistics?.scanStats?.totalScans > 0;

  // Fetch project data
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectScanStatistics(projectId));
      dispatch(getProjectVulnerabilityStatsByCategory(projectId));
      dispatch(getProjectVulnerabilityStatsBySeverity(projectId));
    }
  }, [dispatch, projectId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Project not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {project.name}
        </Typography>
        {project.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {project.description}
          </Typography>
        )}
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Scans"
            value={statistics?.scanStats?.totalScans || 0}
            icon={<SecurityIcon fontSize="large" />}
            color="#2196f3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Last Scan"
            value={statistics?.scanStats?.lastScan ? new Date(statistics.scanStats.lastScan).toLocaleDateString() : 'Never'}
            icon={<AssessmentIcon fontSize="large" />}
            color="#4caf50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vulnerabilities"
            value={statistics?.scanStats?.totalVulnerabilities || 0}
            icon={<BugReportIcon fontSize="large" />}
            color="#f44336"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical/High"
            value={severityStats.filter(s => ['critical', 'high'].includes(s._id))
              .reduce((acc, curr) => acc + curr.count, 0)}
            icon={<WarningIcon fontSize="large" />}
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
              {!hasScanData || categoryStats.length === 0 ? (
                <EmptyChartState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryStats.map(stat => ({
                      name: stat._id.split(' - ')[0],
                      value: stat.count,
                      fullName: stat._id
                    }))}
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
              )}
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
              {!hasScanData || severityStats.length === 0 ? (
                <EmptyChartState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityStats.map(stat => ({
                        name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
                        value: stat.count,
                        color: SEVERITY_COLORS[stat._id]
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {severityStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry._id]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
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
              {!hasScanData ? (
                <EmptyChartState />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: statistics?.scanStats?.openVulnerabilities || 0, color: '#f44336' },
                        { name: 'Fixed', value: statistics?.scanStats?.fixedVulnerabilities || 0, color: '#4caf50' },
                        { name: 'False Positive', value: statistics?.scanStats?.falsePositives || 0, color: '#ff9800' },
                        { name: 'Ignored', value: statistics?.scanStats?.ignoredVulnerabilities || 0, color: '#9e9e9e' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { color: '#f44336' },
                        { color: '#4caf50' },
                        { color: '#ff9800' },
                        { color: '#9e9e9e' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Project details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Team Members
                </Typography>
                <Typography variant="body1">
                  {project.team?.length || 0} members
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDashboard;