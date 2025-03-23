import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import VulnerabilityTable from '../components/vulnerabilities/VulnerabilityTable';
import VulnerabilityStats from '../components/vulnerabilities/VulnerabilityStats';
import VulnerabilityFilters from '../components/vulnerabilities/VulnerabilityFilters';
import { 
  getAllVulnerabilities,
  getVulnerabilityStatsByCategory, 
  getVulnerabilityStatsBySeverity,
  updateVulnerabilityStatus
} from '../redux/slices/vulnerabilitySlice';
import { getProjects } from '../redux/slices/projectSlice'; // Fixed import

// Constants for filter options
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

const Vulnerabilities = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vulnerabilities, categoryStats, severityStats, loading } = useSelector(
    (state) => state.vulnerabilities
  );
  const { projects } = useSelector((state) => state.projects);

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
    projectId: ''
  });

  useEffect(() => {
    // Fetch initial data
    dispatch(getAllVulnerabilities());
    dispatch(getVulnerabilityStatsByCategory());
    dispatch(getVulnerabilityStatsBySeverity());
    dispatch(getProjects()); // Fixed action name
  }, [dispatch]);

  // Watch for project filter changes to redirect to project vulnerabilities page
  useEffect(() => {
    if (filters.projectId) {
      navigate(`/vulnerabilities/project/${filters.projectId}`);
    }
  }, [filters.projectId, navigate]);

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
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handleFilterClear = () => {
    setFilters({
      severity: '',
      category: '',
      status: '',
      search: '',
      projectId: ''
    });
    setPage(0);
  };

  const handleStatusChange = async (vulnerabilityId, newStatus) => {
    await dispatch(updateVulnerabilityStatus({ id: vulnerabilityId, status: newStatus }));
    // Refresh data after status update
    dispatch(getAllVulnerabilities());
    dispatch(getVulnerabilityStatsByCategory());
    dispatch(getVulnerabilityStatsBySeverity());
  };

  // Filter and sort vulnerabilities
  const filteredVulnerabilities = vulnerabilities
    .filter(vuln => {
      return (
        (!filters.severity || vuln.severity === filters.severity) &&
        (!filters.category || vuln.category === filters.category) &&
        (!filters.status || vuln.status === filters.status) &&
        (!filters.search || 
          vuln.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          vuln.projectName?.toLowerCase().includes(filters.search.toLowerCase()))
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
        case 'projectName':
          return (a.projectName || '').localeCompare(b.projectName || '') * 
            (sortDirection === 'asc' ? 1 : -1);
        default:
          return (a[sortBy] > b[sortBy]) ? compareResult : -compareResult;
      }
    });

  const paginatedVulnerabilities = filteredVulnerabilities.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs>
          <Link component={RouterLink} to="/dashboard" color="inherit">
            Dashboard
          </Link>
          <Typography color="textPrimary">Vulnerabilities</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ mt: 2 }}>
          All Vulnerabilities
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
          showProject={true}
        />
      </Box>
    </Container>
  );
};

export default Vulnerabilities;