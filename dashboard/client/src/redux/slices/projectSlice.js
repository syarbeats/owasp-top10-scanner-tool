import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './alertSlice';

// Get all projects
export const getProjects = createAsyncThunk(
  'projects/getProjects',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get('/api/projects');
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch projects';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Get project by ID
export const getProjectById = createAsyncThunk(
  'projects/getProjectById',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch project';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post('/api/projects', formData);
      dispatch(setAlert({ message: 'Project created successfully', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create project';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Update project
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/projects/${id}`, formData);
      dispatch(setAlert({ message: 'Project updated successfully', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update project';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      dispatch(setAlert({ message: 'Project deleted successfully', type: 'success' }));
      return id;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete project';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Add team member to project
export const addTeamMember = createAsyncThunk(
  'projects/addTeamMember',
  async ({ id, email }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/projects/${id}/team`, { email });
      dispatch(setAlert({ message: 'Team member added successfully', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add team member';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove team member from project
export const removeTeamMember = createAsyncThunk(
  'projects/removeTeamMember',
  async ({ projectId, userId }, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.delete(`/api/projects/${projectId}/team/${userId}`);
      dispatch(setAlert({ message: 'Team member removed successfully', type: 'success' }));
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove team member';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState = {
  projects: [],
  project: null,
  loading: false,
  error: null
};

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProject: (state) => {
      state.project = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all projects
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get project by ID
      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        if (state.project && state.project._id === action.payload) {
          state.project = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add team member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove team member
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProject, clearError } = projectSlice.actions;

export default projectSlice.reducer;