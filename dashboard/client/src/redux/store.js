import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import scanReducer from './slices/scanSlice';
import vulnerabilityReducer from './slices/vulnerabilitySlice';
import alertReducer from './slices/alertSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    scans: scanReducer,
    vulnerabilities: vulnerabilityReducer,
    alert: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess', 'auth/loadUserSuccess'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.headers', 'payload.config', 'payload.request'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'projects.projects', 'scans.scans', 'vulnerabilities.vulnerabilities'],
      },
    }),
});

export default store;