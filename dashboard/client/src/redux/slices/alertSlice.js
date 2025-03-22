import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  alerts: []
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: (state, action) => {
      const { message, type, timeout = 5000 } = action.payload;
      const id = uuidv4();
      state.alerts.push({ id, message, type, timeout });
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    }
  }
});

export const { setAlert, removeAlert } = alertSlice.actions;

// Helper function to dispatch an alert with automatic removal
export const showAlert = (message, type = 'info', timeout = 5001) => (dispatch) => {
  const id = uuidv4();
  
  dispatch(setAlert({ id, message, type, timeout }));
  
  setTimeout(() => {
    dispatch(removeAlert(id));
  }, timeout);
};

export default alertSlice.reducer;