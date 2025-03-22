import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, Snackbar, Stack } from '@mui/material';
import { removeAlert } from '../../redux/slices/alertSlice';

/**
 * AlertDisplay component
 * Displays alerts from the alert state
 */
const AlertDisplay = () => {
  const dispatch = useDispatch();
  const { alerts } = useSelector(state => state.alert);

  // Handle alert close
  const handleClose = (id) => {
    dispatch(removeAlert(id));
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={alert.timeout || 5001}
          onClose={() => handleClose(alert.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleClose(alert.id)}
            severity={alert.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default AlertDisplay;