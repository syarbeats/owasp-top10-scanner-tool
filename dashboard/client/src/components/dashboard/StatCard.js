import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

/**
 * StatCard component
 * Displays a statistic with an icon
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number|string} props.value - Statistic value
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.color - Color for the icon background
 */
const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: color,
            color: 'white',
            borderRadius: '50%',
            width: 60,
            height: 60,
            mr: 2
          }}
        >
          {icon}
        </Box>
        
        <Box>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          
          <Typography variant="body1" color="textSecondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;