/**
 * Scanner Module
 * Responsible for scanning projects for OWASP Top Ten vulnerabilities
 */

const fs = require('fs-extra');
const path = require('path');
// Import ora with the correct API for version 6.x
const ora = (...args) => {
  const { default: spinner } = require('ora');
  return spinner(...args);
};
const chalk = require('chalk');
const { getAllRules } = require('../rules');
const { analyzeFile } = require('./analyzer');

/**
 * Scan a project for OWASP Top Ten vulnerabilities
 * @param {string} projectPath - Path to the project to scan
 * @param {Object} options - Scan options
 * @returns {Object} Scan results
 */
async function scan(projectPath, options = {}) {
  const spinner = ora('Preparing scan...').start();
  
  try {
    // Validate project path
    if (!fs.existsSync(projectPath)) {
      spinner.fail(`Project path does not exist: ${projectPath}`);
      throw new Error(`Project path does not exist: ${projectPath}`);
    }
    
    // Load configuration
    const config = options.config ? loadConfig(options.config) : getDefaultConfig();
    
    // Get all rules to check
    const rules = getAllRules();
    spinner.text = `Loaded ${rules.length} vulnerability rules`;
    
    // Get all files to scan
    spinner.text = 'Finding files to scan...';
    const files = await findFilesToScan(projectPath, config.exclude);
    spinner.text = `Found ${files.length} files to scan`;
    
    // Initialize results object
    const results = {
      summary: {
        projectPath,
        timestamp: new Date().toISOString(),
        filesScanned: files.length,
        vulnerabilitiesFound: 0,
      },
      vulnerabilities: [],
    };
    
    // Scan each file
    spinner.text = 'Scanning files for vulnerabilities...';
    let filesScanned = 0;
    
    for (const file of files) {
      filesScanned++;
      spinner.text = `Scanning files for vulnerabilities... (${filesScanned}/${files.length})`;
      
      const relativeFilePath = path.relative(projectPath, file);
      const fileContent = await fs.readFile(file, 'utf8');
      
      // Analyze file for vulnerabilities
      const fileVulnerabilities = await analyzeFile(file, fileContent, rules);
      
      // Add found vulnerabilities to results
      if (fileVulnerabilities.length > 0) {
        results.vulnerabilities.push(
          ...fileVulnerabilities.map(vuln => ({
            ...vuln,
            location: `${relativeFilePath}:${vuln.line}`,
          }))
        );
      }
    }
    
    // Update summary
    results.summary.vulnerabilitiesFound = results.vulnerabilities.length;
    
    spinner.succeed(`Scan completed. Found ${results.vulnerabilities.length} potential vulnerabilities.`);
    return results;
  } catch (error) {
    spinner.fail(`Scan failed: ${error.message}`);
    throw error;
  }
}

/**
 * Load configuration from file
 * @param {string} configPath - Path to configuration file
 * @returns {Object} Configuration object
 */
function loadConfig(configPath) {
  try {
    const configFile = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configFile);
  } catch (error) {
    throw new Error(`Failed to load configuration file: ${error.message}`);
  }
}

/**
 * Get default configuration
 * @returns {Object} Default configuration
 */
function getDefaultConfig() {
  return {
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '**/*.min.js',
    ],
    rules: {
      // Enable all rules by default
    },
  };
}

/**
 * Find all files to scan in a project
 * @param {string} projectPath - Path to the project
 * @param {Array<string>} excludePatterns - Patterns to exclude
 * @returns {Array<string>} Array of file paths
 */
async function findFilesToScan(projectPath, excludePatterns = []) {
  // This is a simplified implementation
  // In a real-world scenario, we would use a more robust solution like glob
  const files = [];
  
  try {
    // Check if the path exists and is a directory
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      return files;
    }
    
    async function scanDirectory(dirPath) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.relative(projectPath, fullPath);
          
          // Check if path should be excluded
          let shouldExclude = false;
          for (const pattern of excludePatterns) {
            // Simple pattern matching (in a real implementation, use minimatch or similar)
            if (pattern.endsWith('/**')) {
              const dir = pattern.slice(0, -3);
              if (relativePath.startsWith(dir)) {
                shouldExclude = true;
                break;
              }
            } else if (pattern.startsWith('**/*.')) {
              const ext = pattern.slice(4);
              if (relativePath.endsWith(ext)) {
                shouldExclude = true;
                break;
              }
            } else if (relativePath === pattern) {
              shouldExclude = true;
              break;
            }
          }
          
          if (shouldExclude) continue;
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else {
            // Only include text files that can be analyzed
            // This is a simplified check - in a real implementation, use a more robust solution
            const ext = path.extname(entry.name).toLowerCase();
            const textFileExts = ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.php', '.py', '.java', '.rb', '.go', '.c', '.cpp', '.cs', '.json'];
            
            if (textFileExts.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${dirPath}: ${error.message}`);
      }
    }
    
    await scanDirectory(projectPath);
  } catch (error) {
    console.error(`Error scanning project: ${error.message}`);
  }
  
  return files;
}

/**
 * Output scan results in the specified format
 * @param {Object} results - Scan results
 * @param {string} format - Output format (json, html, text)
 * @param {string} [outputPath] - Optional path to save the output to a file
 */
async function outputResults(results, format = 'text', outputPath = null) {
  let output;
  
  switch (format.toLowerCase()) {
    case 'json':
      output = JSON.stringify(results, null, 2);
      break;
    case 'html':
      const { generateHtmlReport } = require('../utils/htmlGenerator');
      output = generateHtmlReport(results);
      break;
    case 'text':
    default:
      // Text output is handled in the CLI command
      return;
  }

  if (outputPath) {
    try {
      await fs.writeFile(outputPath, output);
      console.log(chalk.green(`Results saved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`Error saving results: ${error.message}`));
    }
  } else {
    console.log(output);
  }
}

module.exports = {
  scan,
  outputResults,
};