import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { createProject } from '../redux/slices/projectSlice';

/**
 * NewProject component
 * Form for creating a new project
 */
const NewProject = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get loading state from Redux store
  const { loading } = useSelector(state => state.projects);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Destructure form data
  const { name, description } = formData;
  
  // Handle form input change
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Project name cannot exceed 100 characters';
    }
    
    if (description && description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Dispatch create project action
    const resultAction = await dispatch(createProject(formData));
    
    // Navigate to projects list on success
    if (createProject.fulfilled.match(resultAction)) {
      navigate('/projects');
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Project Name"
                name="name"
                value={name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description}
                disabled={loading}
                inputProps={{ maxLength: 500 }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {description.length}/500 characters
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NewProject;