/**
 * Utility Module
 * Common utility functions for the OWASP Scanner
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

/**
 * Get the default configuration directory
 * @returns {string} Default configuration directory
 */
function getConfigDir() {
  return path.join(os.homedir(), '.owasp-scanner');
}

/**
 * Get the default configuration file path
 * @returns {string} Default configuration file path
 */
function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

/**
 * Load configuration from file
 * @param {string} configPath - Path to configuration file
 * @returns {Object} Configuration object
 */
function loadConfig(configPath = getConfigPath()) {
  try {
    if (!fs.existsSync(configPath)) {
      return getDefaultConfig();
    }
    
    const configFile = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configFile);
  } catch (error) {
    console.error(chalk.red(`Error loading configuration: ${error.message}`));
    return getDefaultConfig();
  }
}

/**
 * Get default configuration
 * @returns {Object} Default configuration
 */
function getDefaultConfig() {
  return {
    apiUrl: 'http://localhost:3000/api',
    debug: false,
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '**/*.min.js',
    ],
    rules: {
      // All rules enabled by default
    },
  };
}

/**
 * Save configuration to file
 * @param {Object} config - Configuration object
 * @param {string} configPath - Path to configuration file
 * @returns {boolean} True if successful
 */
function saveConfig(config, configPath = getConfigPath()) {
  try {
    // Create config directory if it doesn't exist
    const configDir = path.dirname(configPath);
    fs.ensureDirSync(configDir);
    
    // Write config file
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(chalk.red(`Error saving configuration: ${error.message}`));
    return false;
  }
}

/**
 * Initialize configuration
 * @param {Object} options - Configuration options
 * @param {boolean} force - Overwrite existing configuration
 * @returns {Object} Configuration object
 */
function initConfig(options = {}, force = false) {
  const configPath = getConfigPath();
  
  // Check if config already exists
  if (fs.existsSync(configPath) && !force) {
    console.log(chalk.yellow('Configuration file already exists. Use --force to overwrite.'));
    return loadConfig(configPath);
  }
  
  // Create default config
  const defaultConfig = getDefaultConfig();
  
  // Merge with provided options
  const config = { ...defaultConfig, ...options };
  
  // Save config
  saveConfig(config, configPath);
  
  console.log(chalk.green(`Configuration initialized at ${configPath}`));
  return config;
}

/**
 * Format a vulnerability for display
 * @param {Object} vulnerability - Vulnerability object
 * @param {boolean} detailed - Show detailed information
 * @returns {string} Formatted vulnerability
 */
function formatVulnerability(vulnerability, detailed = false) {
  const severityColors = {
    critical: chalk.bgRed.white,
    high: chalk.red,
    medium: chalk.yellow,
    low: chalk.blue,
    info: chalk.gray,
  };
  
  const severityColor = severityColors[vulnerability.severity] || chalk.white;
  
  let output = `${chalk.bold(vulnerability.title)} [${severityColor(vulnerability.severity.toUpperCase())}]\n`;
  output += `${chalk.cyan('Category:')} ${vulnerability.category}\n`;
  output += `${chalk.cyan('Location:')} ${vulnerability.location}\n`;
  
  if (detailed) {
    output += `${chalk.cyan('Description:')} ${vulnerability.description}\n`;
    output += `${chalk.cyan('Remediation:')} ${vulnerability.remediation}\n`;
    if (vulnerability.snippet) {
      output += `${chalk.cyan('Code Snippet:')}\n`;
      output += `${chalk.gray(vulnerability.snippet)}\n`;
    }
  }
  
  return output;
}

/**
 * Check if a file should be excluded based on patterns
 * @param {string} filePath - File path
 * @param {Array<string>} excludePatterns - Patterns to exclude
 * @returns {boolean} True if file should be excluded
 */
function shouldExcludeFile(filePath, excludePatterns = []) {
  // Simple pattern matching (in a real implementation, use minimatch or similar)
  return excludePatterns.some(pattern => {
    if (pattern.endsWith('/**')) {
      const dir = pattern.slice(0, -3);
      return filePath.startsWith(dir);
    }
    if (pattern.startsWith('**/*.')) {
      const ext = pattern.slice(4);
      return filePath.endsWith(ext);
    }
    return filePath === pattern;
  });
}

/**
 * Get file type based on extension
 * @param {string} filePath - File path
 * @returns {string|null} File type or null if not supported
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  const fileTypeMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'css',
    '.less': 'css',
    '.php': 'php',
    '.py': 'python',
    '.rb': 'ruby',
    '.java': 'java',
    '.go': 'go',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.sql': 'sql',
  };
  
  return fileTypeMap[ext] || null;
}

module.exports = {
  getConfigDir,
  getConfigPath,
  loadConfig,
  getDefaultConfig,
  saveConfig,
  initConfig,
  formatVulnerability,
  shouldExcludeFile,
  getFileType,
};