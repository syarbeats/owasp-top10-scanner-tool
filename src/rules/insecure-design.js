/**
 * Insecure Design Rules
 * Rules for detecting insecure design vulnerabilities (OWASP Top Ten A04:2021)
 */

module.exports = [
  {
    id: 'A04:2021-001',
    title: 'Missing Rate Limiting',
    category: 'A04:2021 - Insecure Design',
    description: 'Lack of rate limiting on authentication endpoints, allowing brute force attacks.',
    severity: 'medium',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Login routes without rate limiting middleware
      'app\\.(?:post|put)\\([\'"`]/(?:login|signin|auth)[\'"`]',
      'router\\.(?:post|put)\\([\'"`]/(?:login|signin|auth)[\'"`]',
      'app\\.route\\([\'"`]/(?:login|signin|auth)[\'"`]\\)\\.post',
    ],
    remediation: 'Implement rate limiting on authentication endpoints. Use libraries like express-rate-limit for Node.js, django-ratelimit for Python, or similar solutions for other frameworks.',
  },
  {
    id: 'A04:2021-002',
    title: 'Lack of Input Validation',
    category: 'A04:2021 - Insecure Design',
    description: 'Endpoints that process user input without proper validation.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java'],
    patterns: [
      // Direct use of request parameters without validation
      'req\\.body\\.[\\w.]+',
      'req\\.params\\.[\\w.]+',
      'req\\.query\\.[\\w.]+',
      'request\\.form\\[[\'"`]\\w+[\'"`]\\]',
      'request\\.args\\.get\\(',
      '$_POST\\[[\'"`]\\w+[\'"`]\\]',
      '$_GET\\[[\'"`]\\w+[\'"`]\\]',
    ],
    remediation: 'Implement proper input validation using validation libraries like Joi, Yup, or class-validator for JavaScript/TypeScript, or similar libraries for other languages. Validate input data against a schema before processing.',
  },
];