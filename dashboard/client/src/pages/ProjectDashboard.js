import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Button
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import { getProjectById } from '../redux/slices/projectSlice';
import { 
  getProjectVulnerabilityStatsByCategory,
  getProjectVulnerabilityStatsBySeverity 
} from '../redux/slices/vulnerabilitySlice';
import StatCard from '../components/dashboard/StatCard';
import VulnerabilityStats from '../components/vulnerabilities/VulnerabilityStats';
import EmptyChartState from '../components/dashboard/EmptyChartState';

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  
  const project = useSelector(state => 
    state.projects.projects.find(p => p._id === projectId)
  );
  const { severityStats, categoryStats, loading } = useSelector(state => state.vulnerabilities);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectVulnerabilityStatsByCategory(projectId));
      dispatch(getProjectVulnerabilityStatsBySeverity(projectId));
    }
  }, [dispatch, projectId]);

  if (!project) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Typography>Loading project...</Typography>
        </Box>
      </Container>
    );
  }

  const totalVulnerabilities = severityStats.reduce((total, stat) => total + stat.count, 0);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/projects" color="inherit">
            Projects
          </Link>
          <Typography color="textPrimary">{project.name}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="h4">
            {project.name}
          </Typography>
          <Button
            component={RouterLink}
            to={`/vulnerabilities/project/${projectId}`}
            variant="contained"
            color="primary"
            startIcon={<SecurityIcon />}
          >
            View All Vulnerabilities
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Vulnerabilities"
            value={totalVulnerabilities}
            trend={null}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Open Vulnerabilities"
            value={severityStats.reduce((total, stat) => {
              if (stat.status === 'open') return total + stat.count;
              return total;
            }, 0)}
            trend={null}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Fixed Vulnerabilities"
            value={severityStats.reduce((total, stat) => {
              if (stat.status === 'fixed') return total + stat.count;
              return total;
            }, 0)}
            trend={null}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12}>
          {totalVulnerabilities > 0 ? (
            <VulnerabilityStats
              severityStats={severityStats}
              statusStats={categoryStats}
              loading={loading}
            />
          ) : (
            <Paper sx={{ p: 3 }}>
              <EmptyChartState
                message="No vulnerabilities found"
                subMessage="Run a scan to detect vulnerabilities in your project"
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectDashboard;