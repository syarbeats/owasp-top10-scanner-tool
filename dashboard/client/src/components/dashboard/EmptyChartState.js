import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyChartState = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <Typography variant="body1" color="textSecondary">
      No vulnerability data available. Start a scan to see statistics.
    </Typography>
  </Box>
);

export default EmptyChartState;