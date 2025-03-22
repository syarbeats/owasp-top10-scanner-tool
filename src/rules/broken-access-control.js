/**
 * Broken Access Control Rules
 * Rules for detecting broken access control vulnerabilities (OWASP Top Ten A01:2021)
 */

module.exports = [
  {
    id: 'A01:2021-001',
    title: 'Missing Access Control Checks',
    category: 'A01:2021 - Broken Access Control',
    description: 'Endpoints or functions that lack proper authorization checks, allowing unauthorized access to protected resources.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Express.js route definitions without middleware
      'app\\.(?:get|post|put|delete|patch)\\([\'"`][^\'"`,]+[\'"`]\\s*,\\s*(?:async\\s*)?(?:function|\\([^)]*\\)\\s*=>)',
      'router\\.(?:get|post|put|delete|patch)\\([\'"`][^\'"`,]+[\'"`]\\s*,\\s*(?:async\\s*)?(?:function|\\([^)]*\\)\\s*=>)',
      // Controller methods without authorization checks
      'exports\\.\\w+\\s*=\\s*(?:async\\s*)?(?:function|\\([^)]*\\)\\s*=>)',
      'module\\.exports\\.\\w+\\s*=\\s*(?:async\\s*)?(?:function|\\([^)]*\\)\\s*=>)',
    ],
    remediation: 'Implement proper access control checks for all sensitive operations. Use middleware for authentication and authorization in web frameworks. Implement role-based access control (RBAC) or attribute-based access control (ABAC) systems.',
  },
  {
    id: 'A01:2021-002',
    title: 'Insecure Direct Object References (IDOR)',
    category: 'A01:2021 - Broken Access Control',
    description: 'Direct references to objects without proper access control checks, allowing attackers to manipulate references to access unauthorized data.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Database queries with user-supplied IDs without ownership checks
      'findById\\(\\s*req\\.params\\.id\\s*\\)',
      'findOne\\(\\s*\\{\\s*[\'"`]?_?id[\'"`]?\\s*:\\s*req\\.params\\.id\\s*\\}\\s*\\)',
      'findOne\\(\\s*\\{\\s*[\'"`]?_?id[\'"`]?\\s*:\\s*req\\.query\\.id\\s*\\}\\s*\\)',
      'findByPk\\(\\s*req\\.params\\.id\\s*\\)',
      'where\\(\\s*[\'"`]?id[\'"`]?\\s*=\\s*\\?\\s*[\'"`]?,\\s*\\[\\s*req\\.params\\.id\\s*\\]\\s*\\)',
      // PHP patterns
      'SELECT.+?WHERE.+?id\\s*=\\s*\\$_GET\\[.+?\\]',
      'SELECT.+?WHERE.+?id\\s*=\\s*\\$_POST\\[.+?\\]',
      'SELECT.+?WHERE.+?id\\s*=\\s*\\$_REQUEST\\[.+?\\]',
    ],
    remediation: 'Implement access control checks that verify the user has permission to access the requested object. Use indirect references or access control lists. Validate that the authenticated user has permission to access or modify the requested resource.',
  },
  {
    id: 'A01:2021-003',
    title: 'Cross-Origin Resource Sharing (CORS) Misconfiguration',
    category: 'A01:2021 - Broken Access Control',
    description: 'Overly permissive CORS configurations that allow unauthorized domains to access sensitive resources.',
    severity: 'medium',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Permissive CORS headers
      'Access-Control-Allow-Origin\\s*:\\s*[\'"`]\\*[\'"`]',
      'res\\.header\\([\'"`]Access-Control-Allow-Origin[\'"`]\\s*,\\s*[\'"`]\\*[\'"`]\\)',
      'res\\.setHeader\\([\'"`]Access-Control-Allow-Origin[\'"`]\\s*,\\s*[\'"`]\\*[\'"`]\\)',
      'res\\.set\\([\'"`]Access-Control-Allow-Origin[\'"`]\\s*,\\s*[\'"`]\\*[\'"`]\\)',
      'response\\.setHeader\\([\'"`]Access-Control-Allow-Origin[\'"`]\\s*,\\s*[\'"`]\\*[\'"`]\\)',
      'headers\\[[\'"`]Access-Control-Allow-Origin[\'"`]\\]\\s*=\\s*[\'"`]\\*[\'"`]',
      // Dynamic CORS origin without validation
      'Access-Control-Allow-Origin\\s*:\\s*req\\.headers\\.origin',
      'res\\.header\\([\'"`]Access-Control-Allow-Origin[\'"`]\\s*,\\s*req\\.headers\\.origin\\)',
      'res\\.setHeader\\([\'"`]Access-Control-Allow-Origin[\'"`]\\s*,\\s*req\\.headers\\.origin\\)',
    ],
    remediation: 'Restrict CORS access to trusted domains only. Do not use wildcard (*) in production environments. Implement a whitelist of allowed origins and validate incoming Origin headers against this list. Ensure that Access-Control-Allow-Credentials is not used with wildcard origins.',
  },
  {
    id: 'A01:2021-004',
    title: 'Missing Function Level Access Control',
    category: 'A01:2021 - Broken Access Control',
    description: 'Application functions that do not properly check if the user is authorized to access them.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Admin functions without role checks
      'function\\s+admin\\w*\\(',
      'def\\s+admin\\w*\\(',
      'public\\s+(?:static\\s+)?\\w+\\s+admin\\w*\\(',
      // API endpoints with sensitive operations
      '\\.(?:delete|remove|update|edit|create|add)\\w*\\(',
    ],
    remediation: 'Implement consistent access control checks at the function or method level. Use decorators, annotations, or middleware to enforce authorization. Implement role-based access control and verify user permissions before executing sensitive operations.',
  },
  {
    id: 'A01:2021-005',
    title: 'JWT Without Signature Verification',
    category: 'A01:2021 - Broken Access Control',
    description: 'JWT tokens that are accepted without proper signature verification, allowing attackers to forge tokens.',
    severity: 'critical',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // JWT decode without verify
      'jwt\\.decode\\(',
      'jwtDecode\\(',
      'JSON\\.parse\\(Buffer\\.from\\([^,]+\\.split\\([\'"`]\\.[\'"`,]\\)\\[1\\]',
      'JSON\\.parse\\(atob\\([^,]+\\.split\\([\'"`]\\.[\'"`,]\\)\\[1\\]',
      'JSON\\.parse\\(new Buffer\\([^,]+\\.split\\([\'"`]\\.[\'"`,]\\)\\[1\\]',
    ],
    remediation: 'Always verify JWT signatures before trusting the contents. Use jwt.verify() instead of jwt.decode(). Implement proper key management for JWT signing keys. Consider using short-lived tokens and implementing token revocation mechanisms.',
  },
];