import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setAlert } from './alertSlice';

// Set auth token in headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }

    // Set token in headers
    setAuthToken(token);

    try {
      const res = await axios.get('/api/auth/profile');
      return res.data;
    } catch (err) {
      localStorage.removeItem('token');
      setAuthToken();
      return rejectWithValue(
        err.response?.data?.message || 'Failed to load user'
      );
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      // Set token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token in headers
      setAuthToken(res.data.token);
      
      dispatch(setAlert({ message: 'Registration successful', type: 'success' }));
      
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      // Set token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token in headers
      setAuthToken(res.data.token);
      
      dispatch(setAlert({ message: 'Login successful', type: 'success' }));
      
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await axios.put('/api/auth/profile', formData);
      
      dispatch(setAlert({ message: 'Profile updated successfully', type: 'success' }));
      
      return res.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      dispatch(setAlert({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      setAuthToken();
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;