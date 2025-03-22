/**
 * Identification and Authentication Failures Rules
 * Rules for detecting authentication failures vulnerabilities (OWASP Top Ten A07:2021)
 */

module.exports = [
  {
    id: 'A07:2021-001',
    title: 'Weak Password Requirements',
    category: 'A07:2021 - Identification and Authentication Failures',
    description: 'Insufficient password complexity or validation requirements.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Simple password validation
      'password\\.length\\s*>=?\\s*[1-7]\\s*',
      'password\\.length\\s*>\\s*[0-6]\\s*',
      'len\\(password\\)\\s*>=?\\s*[1-7]\\s*',
      'len\\(password\\)\\s*>\\s*[0-6]\\s*',
      // Missing complexity checks
      'validatePassword\\(\\s*password\\s*\\)\\s*{\\s*return\\s*password\\.length',
    ],
    remediation: 'Implement strong password policies that require a minimum length of 8 characters, a mix of character types, and check against common passwords. Consider using a password strength library or NIST guidelines for password requirements.',
  },
  {
    id: 'A07:2021-002',
    title: 'Missing Multi-Factor Authentication',
    category: 'A07:2021 - Identification and Authentication Failures',
    description: 'Lack of multi-factor authentication for sensitive operations or admin access.',
    severity: 'medium',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Login functions without MFA references
      'function\\s+login\\(',
      'function\\s+signIn\\(',
      'function\\s+authenticate\\(',
      'def\\s+login\\(',
      'def\\s+sign_in\\(',
      'def\\s+authenticate\\(',
      'public\\s+(?:static\\s+)?\\w+\\s+login\\(',
    ],
    remediation: 'Implement multi-factor authentication for all authentication flows, especially for administrative access and sensitive operations. Use time-based one-time passwords (TOTP), SMS codes, email verification, or hardware tokens as additional factors.',
  },
  {
    id: 'A07:2021-003',
    title: 'Insecure Session Management',
    category: 'A07:2021 - Identification and Authentication Failures',
    description: 'Improper session handling that could lead to session fixation or hijacking.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Missing session regeneration after login
      'req\\.session\\.user\\s*=',
      'req\\.session\\.userId\\s*=',
      'req\\.session\\.authenticated\\s*=\\s*true',
      'session\\[[\'"`]user[\'"`]\\]\\s*=',
      'session\\[[\'"`]user_id[\'"`]\\]\\s*=',
      'session\\[[\'"`]authenticated[\'"`]\\]\\s*=\\s*true',
      // Insecure cookie settings
      'cookie\\([\'"`]\\w+[\'"`]',
      'Set-Cookie:\\s*\\w+',
    ],
    remediation: 'Regenerate session IDs after authentication. Set secure, HttpOnly, and SameSite flags on cookies. Implement proper session timeout and invalidation mechanisms. Consider using a session management library that follows security best practices.',
  },
];