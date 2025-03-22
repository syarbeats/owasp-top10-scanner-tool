/**
 * Test script to send scan results to the dashboard
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:5001/api';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';
const PROJECT_NAME = 'Test Project';

// Debug output
axios.interceptors.request.use(request => {
  console.log('Request:', request.method.toUpperCase(), request.url);
  console.log('Request data:', request.data);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response.status, response.statusText);
  return response;
}, error => {
  console.error('Response error:', error.message);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  return Promise.reject(error);
});

async function main() {
  try {
    console.log('Testing scanner integration with dashboard...');
    
    // Step 1: Register a new user (if needed)
    try {
      console.log('Registering a new user...');
      await axios.post(`${API_URL}/auth/register`, {
        username: 'testuser',
        email: EMAIL,
        password: PASSWORD
      });
      console.log('Registration successful');
    } catch (regError) {
      console.log('Registration failed or user already exists, proceeding to login');
    }
    
    // Step 2: Login to get token
    console.log('Logging in...');
    const authResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    const token = authResponse.data.token;
    console.log('Login successful, token received');
    
    // Create axios instance with token
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Step 2: Get or create project
    console.log('Fetching projects...');
    const projectsResponse = await api.get('/projects');
    let projectId;
    
    if (projectsResponse.data.length === 0) {
      console.log('No projects found, creating a new one...');
      const newProject = await api.post('/projects', {
        name: PROJECT_NAME,
        description: 'Project for testing scanner integration'
      });
      projectId = newProject.data._id;
      console.log(`Created project: ${PROJECT_NAME} (${projectId})`);
    } else {
      projectId = projectsResponse.data[0]._id;
      console.log(`Using existing project: ${projectsResponse.data[0].name} (${projectId})`);
    }
    
    // Step 3: Create mock scan results
    console.log('Creating mock scan results...');
    const mockResults = {
      projectId: projectId,
      scannerVersion: '1.0.0',
      summary: {
        totalFiles: 10,
        filesScanned: 8,
        vulnerabilitiesFound: 3
      },
      vulnerabilities: [
        {
          ruleId: 'injection-001',
          category: 'A03:2021 - Injection',
          title: 'SQL Injection',
          description: 'Potential SQL injection vulnerability',
          severity: 'high',
          location: 'src/app.js:25',
          line: 25,
          column: 10,
          snippet: 'const query = "SELECT * FROM users WHERE id = " + userId;',
          remediation: 'Use parameterized queries or prepared statements'
        },
        {
          ruleId: 'broken-access-001',
          category: 'A01:2021 - Broken Access Control',
          title: 'Missing Access Control',
          description: 'Endpoint missing access control check',
          severity: 'medium',
          location: 'src/routes/user.js:42',
          line: 42,
          column: 3,
          snippet: 'router.get("/admin", (req, res) => {',
          remediation: 'Add authentication middleware to protect admin routes'
        },
        {
          ruleId: 'crypto-001',
          category: 'A02:2021 - Cryptographic Failures',
          title: 'Weak Cryptography',
          description: 'Using weak cryptographic algorithm',
          severity: 'high',
          location: 'src/utils/crypto.js:15',
          line: 15,
          column: 22,
          snippet: 'const hash = crypto.createHash("md5");',
          remediation: 'Use strong cryptographic algorithms like SHA-256 or better'
        }
      ]
    };
    
    // Step 4: Send scan results to dashboard
    console.log('Sending scan results to dashboard...');
    const scanResponse = await api.post('/scans', mockResults);
    
    console.log('Scan results sent successfully!');
    console.log(`Scan ID: ${scanResponse.data._id}`);
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Error during test:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

main();