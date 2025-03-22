/**
 * Vulnerable and Outdated Components Rules
 * Rules for detecting vulnerable and outdated components (OWASP Top Ten A06:2021)
 */

module.exports = [
  {
    id: 'A06:2021-001',
    title: 'Outdated Package Manager Files',
    category: 'A06:2021 - Vulnerable and Outdated Components',
    description: 'Package manager files that may contain outdated or vulnerable dependencies.',
    severity: 'high',
    fileTypes: ['json', 'txt', 'xml', 'gradle', 'properties'],
    check: async (filePath, content, lines, fileType) => {
      // This is a placeholder for a custom check function
      // In a real implementation, this would parse package files and check versions against vulnerability databases
      
      const vulnerabilities = [];
      const fileName = filePath.split('/').pop();
      
      if (fileName === 'package.json') {
        // Check for Node.js dependencies
        try {
          const pkg = JSON.parse(content);
          
          // This is just a placeholder - in a real implementation, 
          // we would check each dependency against a vulnerability database
          vulnerabilities.push({
            ruleId: 'A06:2021-001',
            category: 'A06:2021 - Vulnerable and Outdated Components',
            title: 'Dependency Scanning Required',
            description: 'Found package.json file. Dependencies should be scanned with a dedicated tool like npm audit, Snyk, or OWASP Dependency Check.',
            severity: 'info',
            line: 1,
            column: 1,
            snippet: 'package.json',
            remediation: 'Run npm audit or use a dedicated dependency scanning tool to check for vulnerabilities in dependencies.',
          });
        } catch (error) {
          // Invalid JSON
          vulnerabilities.push({
            ruleId: 'A06:2021-001',
            category: 'A06:2021 - Vulnerable and Outdated Components',
            title: 'Invalid package.json',
            description: 'The package.json file contains invalid JSON and could not be parsed.',
            severity: 'medium',
            line: 1,
            column: 1,
            snippet: 'package.json',
            remediation: 'Fix the JSON syntax in the package.json file.',
          });
        }
      } else if (fileName === 'requirements.txt') {
        // Check for Python dependencies
        vulnerabilities.push({
          ruleId: 'A06:2021-001',
          category: 'A06:2021 - Vulnerable and Outdated Components',
          title: 'Dependency Scanning Required',
          description: 'Found requirements.txt file. Dependencies should be scanned with a dedicated tool like safety, Snyk, or OWASP Dependency Check.',
          severity: 'info',
          line: 1,
          column: 1,
          snippet: 'requirements.txt',
          remediation: 'Use a dedicated dependency scanning tool to check for vulnerabilities in Python dependencies.',
        });
      } else if (fileName === 'pom.xml') {
        // Check for Java/Maven dependencies
        vulnerabilities.push({
          ruleId: 'A06:2021-001',
          category: 'A06:2021 - Vulnerable and Outdated Components',
          title: 'Dependency Scanning Required',
          description: 'Found pom.xml file. Dependencies should be scanned with a dedicated tool like OWASP Dependency Check or Snyk.',
          severity: 'info',
          line: 1,
          column: 1,
          snippet: 'pom.xml',
          remediation: 'Use a dedicated dependency scanning tool to check for vulnerabilities in Java dependencies.',
        });
      }
      
      return vulnerabilities;
    },
    remediation: 'Regularly update dependencies and use automated tools to scan for vulnerabilities in dependencies. Remove unused dependencies. Subscribe to security advisories for components you use.',
  },
  {
    id: 'A06:2021-002',
    title: 'Vulnerable JavaScript Libraries',
    category: 'A06:2021 - Vulnerable and Outdated Components',
    description: 'Direct inclusion of potentially vulnerable JavaScript libraries.',
    severity: 'high',
    fileTypes: ['html', 'php', 'jsp', 'aspx'],
    patterns: [
      // jQuery < 3.0.0
      '<script[^>]*src=[\'"`][^\'"`]*jquery-1\\.[0-9.]+\\.min\\.js[\'"`]',
      '<script[^>]*src=[\'"`][^\'"`]*jquery-2\\.[0-9.]+\\.min\\.js[\'"`]',
      // Bootstrap < 4.0.0
      '<script[^>]*src=[\'"`][^\'"`]*bootstrap-3\\.[0-9.]+\\.min\\.js[\'"`]',
      // AngularJS < 1.6.0
      '<script[^>]*src=[\'"`][^\'"`]*angular-1\\.[0-5]\\.[0-9.]+\\.min\\.js[\'"`]',
      // Moment.js < 2.19.3
      '<script[^>]*src=[\'"`][^\'"`]*moment-2\\.(?:0|1[0-8]|19\\.[0-2])\\.min\\.js[\'"`]',
    ],
    remediation: 'Update to the latest versions of JavaScript libraries. Consider using package managers instead of direct CDN links to make updates easier. Implement Subresource Integrity (SRI) checks for third-party resources.',
  },
];