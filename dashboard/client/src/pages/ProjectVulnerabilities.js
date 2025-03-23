import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material';
import VulnerabilityTable from '../components/vulnerabilities/VulnerabilityTable';
import VulnerabilityStats from '../components/vulnerabilities/VulnerabilityStats';
import VulnerabilityFilters from '../components/vulnerabilities/VulnerabilityFilters';
import {
  getProjectVulnerabilities,
  getProjectVulnerabilityStatsByCategory,
  getProjectVulnerabilityStatsBySeverity,
  updateVulnerabilityStatus
} from '../redux/slices/vulnerabilitySlice';
import { getProjects } from '../redux/slices/projectSlice';

// Constants for filter options (same as Vulnerabilities.js)
const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];
const STATUS_OPTIONS = ['open', 'fixed', 'false-positive', 'ignored'];
const CATEGORY_OPTIONS = [
  'Broken Access Control',
  'Cryptographic Failures',
  'Injection',
  'Insecure Design',
  'Security Misconfiguration',
  'Vulnerable Components',
  'Authentication Failures',
  'Integrity Failures',
  'Logging Failures',
  'SSRF'
];

const ProjectVulnerabilities = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { vulnerabilities, categoryStats, severityStats, loading } = useSelector(
    (state) => state.vulnerabilities
  );
  const { projects } = useSelector((state) => state.projects);
  const currentProject = useSelector((state) => 
    state.projects.projects.find(p => p._id === projectId)
  );

  // Local state for pagination and sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('severity');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    severity: '',
    category: '',
    status: '',
    search: '',
    projectId: projectId // Initialize with current project ID
  });

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projectId) {
      dispatch(getProjectVulnerabilities(projectId));
      dispatch(getProjectVulnerabilityStatsByCategory(projectId));
      dispatch(getProjectVulnerabilityStatsBySeverity(projectId));
      // Update filter when projectId changes
      setFilters(prev => ({ ...prev, projectId }));
    }
  }, [dispatch, projectId]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (column, direction) => {
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleFilterChange = (newFilters) => {
    // If project selection changes, navigate to the new project's vulnerability page
    if (newFilters.projectId !== filters.projectId) {
      if (newFilters.projectId) {
        navigate(`/vulnerabilities/project/${newFilters.projectId}`);
      } else {
        navigate('/vulnerabilities');
      }
      return;
    }
    
    setFilters(newFilters);
    setPage(0);
  };

  const handleFilterClear = () => {
    // Don't clear project selection in project view
    setFilters({
      severity: '',
      category: '',
      status: '',
      search: '',
      projectId: projectId // Keep the current project selected
    });
    setPage(0);
  };

  const handleStatusChange = async (vulnerabilityId, newStatus) => {
    await dispatch(updateVulnerabilityStatus({ id: vulnerabilityId, status: newStatus }));
    // Refresh project-specific data after status update
    dispatch(getProjectVulnerabilities(projectId));
    dispatch(getProjectVulnerabilityStatsByCategory(projectId));
    dispatch(getProjectVulnerabilityStatsBySeverity(projectId));
  };

  // Filter and sort vulnerabilities
  const filteredVulnerabilities = vulnerabilities
    .filter(vuln => {
      return (
        (!filters.severity || vuln.severity === filters.severity) &&
        (!filters.category || vuln.category === filters.category) &&
        (!filters.status || vuln.status === filters.status) &&
        (!filters.search || 
          vuln.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    })
    .sort((a, b) => {
      const compareResult = sortDirection === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'severity':
          return SEVERITY_OPTIONS.indexOf(a.severity) > SEVERITY_OPTIONS.indexOf(b.severity) 
            ? compareResult 
            : -compareResult;
        case 'createdAt':
          return new Date(a.createdAt) > new Date(b.createdAt) 
            ? compareResult 
            : -compareResult;
        default:
          return (a[sortBy] > b[sortBy]) ? compareResult : -compareResult;
      }
    });

  const paginatedVulnerabilities = filteredVulnerabilities.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  if (!currentProject) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/vulnerabilities" color="inherit">
            Vulnerabilities
          </Link>
          <Typography color="textPrimary">{currentProject.name}</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ mt: 2 }}>
          {currentProject.name} - Vulnerabilities
        </Typography>
      </Box>

      <VulnerabilityStats
        severityStats={severityStats}
        statusStats={categoryStats}
      />

      <Box sx={{ mt: 4 }}>
        <VulnerabilityFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onFilterClear={handleFilterClear}
          severityOptions={SEVERITY_OPTIONS}
          categoryOptions={CATEGORY_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          projectOptions={projects}
          showProjectFilter={true}
        />

        <VulnerabilityTable
          vulnerabilities={paginatedVulnerabilities}
          onStatusChange={handleStatusChange}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          totalCount={filteredVulnerabilities.length}
          loading={loading}
          showProject={false}
        />
      </Box>
    </Container>
  );
};

export default ProjectVulnerabilities;