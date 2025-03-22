/**
 * Security Logging and Monitoring Failures Rules
 * Rules for detecting security logging and monitoring failures (OWASP Top Ten A09:2021)
 */

module.exports = [
  {
    id: 'A09:2021-001',
    title: 'Insufficient Logging',
    category: 'A09:2021 - Security Logging and Monitoring Failures',
    description: 'Lack of logging for security-relevant events such as authentication, access control, or input validation failures.',
    severity: 'medium',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Authentication without logging
      'function\\s+(?:login|authenticate|signIn)\\s*\\([^)]*\\)\\s*\\{(?![^}]*log)',
      'def\\s+(?:login|authenticate|sign_in)\\s*\\([^)]*\\)\\s*:(?![^:]*log)',
      // Error handling without logging
      'catch\\s*\\([^)]*\\)\\s*\\{(?![^}]*log)',
      'except\\s+(?:Exception|\\w+Error)\\s+as\\s+\\w+\\s*:(?![^:]*log)',
      // Access control without logging
      'function\\s+(?:authorize|checkPermission)\\s*\\([^)]*\\)\\s*\\{(?![^}]*log)',
      'def\\s+(?:authorize|check_permission)\\s*\\([^)]*\\)\\s*:(?![^:]*log)',
    ],
    remediation: 'Implement comprehensive logging for security-relevant events, including authentication successes and failures, authorization failures, input validation failures, and other security exceptions. Include relevant details like user IDs, timestamps, and affected resources in log entries.',
  },
  {
    id: 'A09:2021-002',
    title: 'Sensitive Data in Logs',
    category: 'A09:2021 - Security Logging and Monitoring Failures',
    description: 'Logging of sensitive data such as passwords, session tokens, or personal information.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Logging sensitive data
      'log\\([^)]*password',
      'log\\([^)]*token',
      'log\\([^)]*secret',
      'log\\([^)]*creditCard',
      'log\\([^)]*ssn',
      'logger\\.\\w+\\([^)]*password',
      'logger\\.\\w+\\([^)]*token',
      'logger\\.\\w+\\([^)]*secret',
      'logger\\.\\w+\\([^)]*creditCard',
      'logger\\.\\w+\\([^)]*ssn',
      'console\\.\\w+\\([^)]*password',
      'console\\.\\w+\\([^)]*token',
      'console\\.\\w+\\([^)]*secret',
      'console\\.\\w+\\([^)]*creditCard',
      'console\\.\\w+\\([^)]*ssn',
    ],
    remediation: 'Implement data sanitization for log entries to remove or mask sensitive information. Use logging frameworks that support redaction of sensitive fields. Review logs to ensure they do not contain sensitive data. Consider using specialized security logging libraries.',
  },
  {
    id: 'A09:2021-003',
    title: 'Missing Audit Trails',
    category: 'A09:2021 - Security Logging and Monitoring Failures',
    description: 'Lack of audit logging for critical operations or data modifications.',
    severity: 'medium',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Database operations without audit logging
      'update\\([^)]*\\)(?![^;]*log)',
      'delete\\([^)]*\\)(?![^;]*log)',
      'remove\\([^)]*\\)(?![^;]*log)',
      'save\\([^)]*\\)(?![^;]*log)',
      'create\\([^)]*\\)(?![^;]*log)',
      // Admin operations without audit logging
      'function\\s+admin\\w*\\([^)]*\\)\\s*\\{(?![^}]*log)',
      'def\\s+admin\\w*\\([^)]*\\)\\s*:(?![^:]*log)',
    ],
    remediation: 'Implement audit logging for all critical operations, especially those that modify data or affect system security. Include details about who performed the action, what was changed, and when the change occurred. Consider using an audit logging framework or library.',
  },
];