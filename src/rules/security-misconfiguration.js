/**
 * Security Misconfiguration Rules
 * Rules for detecting security misconfiguration vulnerabilities (OWASP Top Ten A05:2021)
 */

module.exports = [
  {
    id: 'A05:2021-001',
    title: 'Default or Weak Credentials',
    category: 'A05:2021 - Security Misconfiguration',
    description: 'Use of default, weak, or hardcoded credentials in configuration files.',
    severity: 'critical',
    fileTypes: ['javascript', 'typescript', 'json', 'yaml', 'xml', 'properties', 'config'],
    patterns: [
      // Default usernames and passwords
      'username[\'"`]?\\s*[:=]\\s*[\'"`](?:admin|root|user|test|guest)[\'"`]',
      'password[\'"`]?\\s*[:=]\\s*[\'"`](?:admin|root|password|123456|test|guest)[\'"`]',
      'user[\'"`]?\\s*[:=]\\s*[\'"`](?:admin|root|user|test|guest)[\'"`]',
      'pass[\'"`]?\\s*[:=]\\s*[\'"`](?:admin|root|password|123456|test|guest)[\'"`]',
    ],
    remediation: 'Use strong, unique credentials for all environments. Store credentials in environment variables or a secure vault, not in configuration files. Implement proper secrets management.',
  },
  {
    id: 'A05:2021-002',
    title: 'Verbose Error Messages',
    category: 'A05:2021 - Security Misconfiguration',
    description: 'Detailed error messages that could reveal sensitive information about the application.',
    severity: 'medium',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Sending error details to client
      'res\\.send\\(\\s*err\\s*\\)',
      'res\\.send\\(\\s*error\\s*\\)',
      'res\\.json\\(\\s*err\\s*\\)',
      'res\\.json\\(\\s*error\\s*\\)',
      'console\\.error\\(\\s*err\\s*\\)',
      'console\\.log\\(\\s*err\\s*\\)',
      'print\\(\\s*e\\s*\\)',
      'print\\(\\s*exception\\s*\\)',
      'printStackTrace\\(\\)',
    ],
    remediation: 'Implement proper error handling that does not expose sensitive details to users. Log detailed errors server-side but return generic error messages to clients. Use a production mode that limits error details in responses.',
  },
];