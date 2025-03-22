/**
 * API Client Module
 * Responsible for communicating with the OWASP Scanner Dashboard
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const readline = require('readline');

// Default configuration file path
const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.owasp-scanner', 'config.json');

/**
 * API Client for communicating with the OWASP Scanner Dashboard
 */
class ApiClient {
  /**
   * Create a new API client
   * @param {Object} options - Client options
   * @param {string} options.apiUrl - API URL
   * @param {string} options.token - JWT token
   * @param {string} options.projectId - Project ID
   * @param {boolean} options.debug - Enable debug mode
   */
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.OWASP_SCANNER_API_URL || 'http://localhost:5001/api';
    this.token = options.token || process.env.OWASP_SCANNER_TOKEN;
    this.projectId = options.projectId || process.env.OWASP_SCANNER_PROJECT_ID;
    this.debug = options.debug || false;
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'owasp-scanner-cli',
      },
    });
    
    // Add token if available
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Add request/response interceptors for debugging
    if (this.debug) {
      this.client.interceptors.request.use(request => {
        console.log(chalk.blue('API Request:'), request.method.toUpperCase(), request.url);
        return request;
      });
      
      this.client.interceptors.response.use(response => {
        console.log(chalk.green('API Response:'), response.status, response.statusText);
        return response;
      }, error => {
        console.error(chalk.red('API Error:'), error.message);
        return Promise.reject(error);
      });
    }
  }
  
  /**
   * Load configuration from file
   * @param {string} configPath - Path to configuration file
   * @returns {ApiClient} API client instance
   */
  static fromConfigFile(configPath = DEFAULT_CONFIG_PATH) {
    try {
      if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return new ApiClient(config);
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }
  
  /**
   * Initialize configuration interactively
   * @returns {Promise<ApiClient>} API client instance
   */
  static async initInteractive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (query) => new Promise(resolve => rl.question(query, resolve));
    
    try {
      console.log(chalk.blue('OWASP Scanner Dashboard Configuration'));
      console.log(chalk.blue('====================================='));
      
      const apiUrl = await question('Dashboard API URL [http://localhost:5001/api]: ');
      const email = await question('Email: ');
      const password = await question('Password: ');
      
      // Create config directory if it doesn't exist
      const configDir = path.dirname(DEFAULT_CONFIG_PATH);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // Login to get token
      const client = new ApiClient({
        apiUrl: apiUrl || 'http://localhost:5001/api'
      });
      
      console.log(chalk.blue('Logging in...'));
      const authResponse = await client.login(email, password);
      
      // Get projects
      console.log(chalk.blue('Fetching projects...'));
      const projects = await client.getProjects();
      
      if (projects.length === 0) {
        console.log(chalk.yellow('No projects found. Creating a new project...'));
        const projectName = await question('Project name: ');
        const projectDescription = await question('Project description (optional): ');
        
        const project = await client.createProject({
          name: projectName,
          description: projectDescription
        });
        
        console.log(chalk.green(`Project created: ${project.name} (${project._id})`));
        client.projectId = project._id;
      } else {
        console.log(chalk.blue('Available projects:'));
        projects.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} (${project._id})`);
        });
        
        const projectIndex = await question(`Select project (1-${projects.length}): `);
        const selectedProject = projects[parseInt(projectIndex) - 1];
        
        if (!selectedProject) {
          throw new Error('Invalid project selection');
        }
        
        console.log(chalk.green(`Selected project: ${selectedProject.name} (${selectedProject._id})`));
        client.projectId = selectedProject._id;
      }
      
      // Save configuration
      const config = {
        apiUrl: client.apiUrl,
        token: client.token,
        projectId: client.projectId
      };
      
      fs.writeFileSync(DEFAULT_CONFIG_PATH, JSON.stringify(config, null, 2));
      console.log(chalk.green(`Configuration saved to ${DEFAULT_CONFIG_PATH}`));
      
      rl.close();
      return client;
    } catch (error) {
      rl.close();
      throw error;
    }
  }
  
  /**
   * Login to the dashboard
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      this.token = response.data.token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Login failed: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  
  /**
   * Get all projects
   * @returns {Promise<Array>} Projects
   */
  async getProjects() {
    try {
      const response = await this.client.get('/projects');
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  
  /**
   * Get project information
   * @param {string} projectId - Project ID (optional, uses this.projectId if not provided)
   * @returns {Promise<Object>} Project information
   */
  async getProject(projectId = this.projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    try {
      const response = await this.client.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  
  /**
   * Create a new project
   * @param {Object} project - Project information
   * @returns {Promise<Object>} Created project
   */
  async createProject(project) {
    try {
      const response = await this.client.post('/projects', project);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  
  /**
   * Send scan results to the dashboard
   * @param {Object} results - Scan results
   * @param {string} projectId - Project ID (optional, uses this.projectId if not provided)
   * @returns {Promise<Object>} API response
   */
  async sendResults(results, projectId = this.projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // Helper function to normalize category format
    const normalizeCategory = (category) => {
      if (!category) return '';
      
      // List of valid categories from the Vulnerability model
      const validCategories = [
        'A01:2021 - Broken Access Control',
        'A02:2021 - Cryptographic Failures',
        'A03:2021 - Injection',
        'A04:2021 - Insecure Design',
        'A05:2021 - Security Misconfiguration',
        'A06:2021 - Vulnerable and Outdated Components',
        'A07:2021 - Identification and Authentication Failures',
        'A08:2021 - Software and Data Integrity Failures',
        'A09:2021 - Security Logging and Monitoring Failures',
        'A10:2021 - Server-Side Request Forgery'
      ];
      
      // Try to match the category to a valid one
      const categoryCode = category.split(/\s*[-–]\s*/)[0].trim();
      const matchingCategory = validCategories.find(c => c.startsWith(categoryCode));
      
      if (matchingCategory) {
        return matchingCategory;
      }
      
      // If no match found, replace any en dash with hyphen and normalize spaces
      return category.replace(/–/g, '-').replace(/\s+/g, ' ').trim();
    };
    
    try {
      // Prepare scan data
      const scanData = {
        projectId,
        scannerVersion: results.scannerVersion || '1.0.0',
        summary: {
          totalFiles: results.summary.totalFiles || results.summary.filesScanned,
          filesScanned: results.summary.filesScanned,
          vulnerabilitiesFound: results.summary.vulnerabilitiesFound
        },
        vulnerabilities: results.vulnerabilities.map(vuln => ({
          ruleId: vuln.ruleId,
          category: normalizeCategory(vuln.category),
          title: vuln.title,
          description: vuln.description,
          severity: vuln.severity,
          location: vuln.location,
          line: vuln.line,
          column: vuln.column || 0,
          snippet: vuln.snippet || '',
          remediation: vuln.remediation || ''
        }))
      };
      
      const response = await this.client.post('/scans', scanData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  
  /**
   * Get remediation suggestions for a vulnerability
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Object>} Remediation suggestions
   */
  async getRemediation(ruleId) {
    try {
      const response = await this.client.get(`/vulnerabilities/remediation/${ruleId}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API error: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  
  /**
   * Check API connection
   * @returns {Promise<boolean>} True if connected
   */
  async checkConnection() {
    try {
      const response = await this.client.get('/auth/profile');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ApiClient;