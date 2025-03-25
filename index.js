#!/usr/bin/env node

/**
 * OWASP Top Ten Compliance Scanner
 * A CLI tool for scanning applications for OWASP Top Ten vulnerabilities
 */

const { program } = require('commander');
const chalk = require('chalk');
const scanner = require('./src/scanner');
const pkg = require('./package.json');

// Set up the CLI program
program
  .name('owasp-scanner')
  .description('CLI tool for scanning applications for OWASP Top Ten vulnerabilities')
  .version(pkg.version);

// Scan command
program
  .command('scan')
  .description('Scan a project for OWASP Top Ten vulnerabilities')
  .argument('<path>', 'Path to the project to scan')
  .option('-o, --output <format>', 'Output format (json, html, text)', 'text')
  .option('-f, --output-file <path>', 'Path to save the output file')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('--offline', 'Run in offline mode without sending results to dashboard')
  .action(async (path, options) => {
    try {
      console.log(chalk.blue('Starting OWASP Top Ten vulnerability scan...'));
      console.log(chalk.gray(`Scanning project at: ${path}`));
      
      const results = await scanner.scan(path, options);
      
      console.log(chalk.green('\nScan completed successfully!'));
      console.log(chalk.yellow(`Found ${results.vulnerabilities.length} potential vulnerabilities.`));
      
      // Display summary of results
      if (results.vulnerabilities.length > 0) {
        console.log('\nVulnerability Summary:');
        results.vulnerabilities.forEach((vuln, index) => {
          console.log(`${index + 1}. ${chalk.red(vuln.title)} - ${vuln.category}`);
          console.log(`   ${chalk.gray(vuln.description)}`);
          console.log(`   ${chalk.cyan('Location:')} ${vuln.location}`);
          console.log();
        });
      }
      // Output detailed results based on format
      await scanner.outputResults(results, options.output, options.outputFile);
      scanner.outputResults(results, options.output);
      
      // Send results to dashboard if not in offline mode
      if (!options.offline) {
        console.log(chalk.blue('Sending results to dashboard...'));
        
        try {
          // Import API client
          const ApiClient = require('./src/api');
          const fs = require('fs');
          const path = require('path');
          const os = require('os');
          
          // Try to load API client from config file
          const configPath = path.join(os.homedir(), '.owasp-scanner', 'config.json');
          let apiClient;
          
          if (fs.existsSync(configPath)) {
            apiClient = ApiClient.fromConfigFile(configPath);
          } else {
            console.log(chalk.yellow('Dashboard configuration not found.'));
            console.log(chalk.yellow('Run `owasp-scanner init` to configure dashboard integration.'));
            return;
          }
          
          // Check connection
          const connected = await apiClient.checkConnection();
          if (!connected) {
            console.log(chalk.red('Failed to connect to dashboard. Please check your configuration.'));
            return;
          }
          
          // Send results
          const response = await apiClient.sendResults(results);
          console.log(chalk.green(`Scan results sent to dashboard. Scan ID: ${response._id}`));
        } catch (error) {
          console.log(chalk.red(`Failed to send results to dashboard: ${error.message}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Error during scan:'), error.message);
      process.exit(1);
    }
  });

// Initialize command
program
  .command('init')
  .description('Initialize a configuration file for the scanner')
  .option('-f, --force', 'Overwrite existing configuration file')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Initializing OWASP Scanner configuration...'));
      
      // Import API client
      const ApiClient = require('./src/api');
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      // Check if config file already exists
      const configPath = path.join(os.homedir(), '.owasp-scanner', 'config.json');
      
      if (fs.existsSync(configPath) && !options.force) {
        console.log(chalk.yellow('Configuration file already exists.'));
        console.log(chalk.yellow('Use --force to overwrite.'));
        return;
      }
      
      // Initialize configuration interactively
      try {
        await ApiClient.initInteractive();
        console.log(chalk.green('Configuration file created successfully!'));
      } catch (error) {
        console.error(chalk.red('Failed to initialize configuration:'), error.message);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error during initialization:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}