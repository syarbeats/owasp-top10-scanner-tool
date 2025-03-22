/**
 * Injection Rules
 * Rules for detecting injection vulnerabilities (OWASP Top Ten A03:2021)
 */

module.exports = [
  {
    id: 'A03:2021-001',
    title: 'SQL Injection',
    category: 'A03:2021 - Injection',
    description: 'SQL injection occurs when untrusted data is sent to an interpreter as part of a command or query.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'ruby', 'java'],
    patterns: [
      // JavaScript/Node.js patterns
      'db\\.query\\(\\s*[\'"`]\\s*SELECT.+?\\$\\{.+?\\}',
      'db\\.query\\(\\s*[\'"`]\\s*INSERT.+?\\$\\{.+?\\}',
      'db\\.query\\(\\s*[\'"`]\\s*UPDATE.+?\\$\\{.+?\\}',
      'db\\.query\\(\\s*[\'"`]\\s*DELETE.+?\\$\\{.+?\\}',
      'connection\\.query\\(\\s*[\'"`]\\s*SELECT.+?\\$\\{.+?\\}',
      'connection\\.query\\(\\s*[\'"`]\\s*INSERT.+?\\$\\{.+?\\}',
      'connection\\.query\\(\\s*[\'"`]\\s*UPDATE.+?\\$\\{.+?\\}',
      'connection\\.query\\(\\s*[\'"`]\\s*DELETE.+?\\$\\{.+?\\}',
      // PHP patterns
      'mysql_query\\(\\s*[\'"`]\\s*SELECT.+?\\$',
      'mysqli_query\\(\\s*[\'"`]\\s*SELECT.+?\\$',
      // Python patterns
      'cursor\\.execute\\(\\s*[\'"`]\\s*SELECT.+?%s',
      'cursor\\.execute\\(\\s*[\'"`]\\s*SELECT.+?\\{.+?\\}',
      'cursor\\.execute\\(\\s*f[\'"`]\\s*SELECT',
    ],
    remediation: 'Use parameterized queries or prepared statements instead of building SQL queries with string concatenation. Use an ORM or query builder that handles parameter sanitization automatically.',
  },
  {
    id: 'A03:2021-002',
    title: 'NoSQL Injection',
    category: 'A03:2021 - Injection',
    description: 'NoSQL injection occurs when untrusted data is sent to a NoSQL database in an unsafe manner.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'python'],
    patterns: [
      // MongoDB patterns (JavaScript/Node.js)
      'find\\(\\s*\\{\\s*[\'"`].+?[\'"`]\\s*:\\s*\\$\\{.+?\\}',
      'findOne\\(\\s*\\{\\s*[\'"`].+?[\'"`]\\s*:\\s*\\$\\{.+?\\}',
      'updateOne\\(\\s*\\{\\s*[\'"`].+?[\'"`]\\s*:\\s*\\$\\{.+?\\}',
      'updateMany\\(\\s*\\{\\s*[\'"`].+?[\'"`]\\s*:\\s*\\$\\{.+?\\}',
      'deleteOne\\(\\s*\\{\\s*[\'"`].+?[\'"`]\\s*:\\s*\\$\\{.+?\\}',
      'deleteMany\\(\\s*\\{\\s*[\'"`].+?[\'"`]\\s*:\\s*\\$\\{.+?\\}',
      // MongoDB with user input in query operators
      '\\{\\s*\\$where\\s*:\\s*[\'"`]',
    ],
    remediation: 'Use parameterized queries with MongoDB\'s query operators. Validate and sanitize user input before using it in database queries. Use MongoDB\'s aggregation framework for complex queries instead of $where operator.',
  },
  {
    id: 'A03:2021-003',
    title: 'Command Injection',
    category: 'A03:2021 - Injection',
    description: 'Command injection occurs when untrusted data is sent to a system shell.',
    severity: 'critical',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'ruby', 'java'],
    patterns: [
      // JavaScript/Node.js patterns
      'exec\\(\\s*[\'"`].+?\\$\\{.+?\\}',
      'execSync\\(\\s*[\'"`].+?\\$\\{.+?\\}',
      'spawn\\(\\s*[\'"`].+?\\$\\{.+?\\}',
      'spawnSync\\(\\s*[\'"`].+?\\$\\{.+?\\}',
      'child_process\\.exec\\(',
      // PHP patterns
      'shell_exec\\(\\s*\\$',
      'exec\\(\\s*\\$',
      'system\\(\\s*\\$',
      'passthru\\(\\s*\\$',
      // Python patterns
      'os\\.system\\(\\s*[\'"`].+?\\{.+?\\}',
      'os\\.system\\(\\s*f[\'"`]',
      'subprocess\\.call\\(\\s*[\'"`].+?\\{.+?\\}',
      'subprocess\\.call\\(\\s*f[\'"`]',
      'subprocess\\.Popen\\(\\s*[\'"`].+?\\{.+?\\}',
      'subprocess\\.Popen\\(\\s*f[\'"`]',
    ],
    remediation: 'Avoid using system commands when possible. If necessary, use libraries that handle command arguments properly without string concatenation. Validate and sanitize user input before using it in system commands.',
  },
  {
    id: 'A03:2021-004',
    title: 'Cross-Site Scripting (XSS)',
    category: 'A03:2021 - Injection',
    description: 'XSS occurs when untrusted data is included in a web page without proper validation or escaping.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'html', 'php'],
    patterns: [
      // JavaScript/Node.js patterns
      'innerHTML\\s*=\\s*[\'"`].+?\\$\\{.+?\\}',
      'outerHTML\\s*=\\s*[\'"`].+?\\$\\{.+?\\}',
      'document\\.write\\(\\s*[\'"`].+?\\$\\{.+?\\}',
      'element\\.insertAdjacentHTML\\(',
      // React patterns (potentially unsafe)
      'dangerouslySetInnerHTML\\s*=\\s*\\{\\{\\s*__html:\\s*',
      // Angular patterns (potentially unsafe)
      '\\[innerHTML\\]\\s*=\\s*[\'"`]',
      // PHP patterns
      'echo\\s+\\$_GET',
      'echo\\s+\\$_POST',
      'echo\\s+\\$_REQUEST',
      'print\\s+\\$_GET',
      'print\\s+\\$_POST',
      'print\\s+\\$_REQUEST',
    ],
    remediation: 'Use context-specific output encoding when including dynamic data in HTML, JavaScript, CSS, or URLs. Use modern frameworks that automatically escape output. For React, avoid dangerouslySetInnerHTML. For user-generated HTML content, use a library like DOMPurify to sanitize the HTML.',
  },
  {
    id: 'A03:2021-005',
    title: 'XML Injection (XXE)',
    category: 'A03:2021 - Injection',
    description: 'XML External Entity (XXE) injection occurs when XML parsers process external entity references in untrusted XML data.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'java', 'php', 'python'],
    patterns: [
      // JavaScript/Node.js patterns
      'libxmljs\\.parseXml\\(',
      'DOMParser\\(\\)',
      'new\\s+DOMParser\\(\\)',
      // Java patterns
      'DocumentBuilderFactory\\.newInstance\\(\\)',
      'SAXParserFactory\\.newInstance\\(\\)',
      'XMLInputFactory\\.newInstance\\(\\)',
      // PHP patterns
      'simplexml_load_',
      'DOMDocument\\(\\)',
      'new\\s+DOMDocument\\(\\)',
      // Python patterns
      'etree\\.parse\\(',
      'minidom\\.parse\\(',
      'sax\\.parse\\(',
    ],
    remediation: 'Configure XML parsers to disable external entity processing and DTD processing. Use JSON instead of XML when possible. If XML is required, validate and sanitize XML input before processing.',
  },
];