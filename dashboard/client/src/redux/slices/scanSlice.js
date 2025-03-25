import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './alertSlice';

// Get scans for a project
export const getProjectScans = createAsyncThunk(
  'scans/getProjectScans',
  async (projectId, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/scans`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch scans';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Get scan by ID
export const getScanById = createAsyncThunk(
  'scans/getScanById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/scans/${id}`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch scan';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new scan
export const createScan = createAsyncThunk(
  'scans/createScan',
  async (scanData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post('/api/scans', scanData);
      dispatch(setAlert({ message: 'Scan created successfully', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create scan';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete scan
export const deleteScan = createAsyncThunk(
  'scans/deleteScan',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`/api/scans/${id}`);
      dispatch(setAlert({ message: 'Scan deleted successfully', type: 'success' }));
      return id;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete scan';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Get scan vulnerabilities
export const getScanVulnerabilities = createAsyncThunk(
  'scans/getScanVulnerabilities',
  async (scanId, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/scans/${scanId}/vulnerabilities`);
      return { scanId, vulnerabilities: res.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch vulnerabilities';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Get scan statistics
export const getScanStatistics = createAsyncThunk(
  'scans/getScanStatistics',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get('/api/scans/stats/overview');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch scan statistics';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Get project scan statistics
export const getProjectScanStatistics = createAsyncThunk(
  'scans/getProjectScanStatistics',
  async (projectId, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${projectId}/scans/stats`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch project scan statistics';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState = {
  scans: [],
  scan: null,
  vulnerabilities: [],
  statistics: null,
  loading: false,
  error: null
};

// Scan slice
const scanSlice = createSlice({
  name: 'scans',
  initialState,
  reducers: {
    clearScan: (state) => {
      state.scan = null;
      state.vulnerabilities = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get project scans
      .addCase(getProjectScans.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjectScans.fulfilled, (state, action) => {
        state.loading = false;
        state.scans = action.payload;
      })
      .addCase(getProjectScans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get scan by ID
      .addCase(getScanById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getScanById.fulfilled, (state, action) => {
        state.loading = false;
        state.scan = action.payload;
      })
      .addCase(getScanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create scan
      .addCase(createScan.pending, (state) => {
        state.loading = true;
      })
      .addCase(createScan.fulfilled, (state, action) => {
        state.loading = false;
        state.scans.unshift(action.payload);
        state.scan = action.payload;
      })
      .addCase(createScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete scan
      .addCase(deleteScan.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteScan.fulfilled, (state, action) => {
        state.loading = false;
        state.scans = state.scans.filter(scan => scan._id !== action.payload);
        if (state.scan && state.scan._id === action.payload) {
          state.scan = null;
        }
      })
      .addCase(deleteScan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get scan vulnerabilities
      .addCase(getScanVulnerabilities.pending, (state) => {
        state.loading = true;
      })
      .addCase(getScanVulnerabilities.fulfilled, (state, action) => {
        state.loading = false;
        state.vulnerabilities = action.payload.vulnerabilities;
      })
      .addCase(getScanVulnerabilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get scan statistics
      .addCase(getScanStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getScanStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getScanStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get project scan statistics
      .addCase(getProjectScanStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjectScanStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(getProjectScanStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearScan, clearError } = scanSlice.actions;

export default scanSlice.reducer;