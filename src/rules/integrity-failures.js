/**
 * Software and Data Integrity Failures Rules
 * Rules for detecting software and data integrity failures (OWASP Top Ten A08:2021)
 */

module.exports = [
  {
    id: 'A08:2021-001',
    title: 'Insecure Deserialization',
    category: 'A08:2021 - Software and Data Integrity Failures',
    description: 'Unsafe deserialization of user-supplied data that could lead to remote code execution.',
    severity: 'critical',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // JavaScript/Node.js
      'JSON\\.parse\\(',
      'eval\\(',
      'unserialize\\(',
      'deserialize\\(',
      // PHP
      'unserialize\\(',
      // Python
      'pickle\\.loads\\(',
      'yaml\\.load\\(',
      // Java
      'ObjectInputStream\\(',
      'readObject\\(',
      'readUnshared\\(',
      // Ruby
      'Marshal\\.load\\(',
      'YAML\\.load\\(',
    ],
    remediation: 'Avoid deserializing data from untrusted sources. If deserialization is necessary, implement integrity checks like digital signatures or use safer alternatives like JSON with schema validation. For specific languages, use secure deserialization libraries that limit object creation.',
  },
  {
    id: 'A08:2021-002',
    title: 'Missing Subresource Integrity',
    category: 'A08:2021 - Software and Data Integrity Failures',
    description: 'External scripts or stylesheets loaded without Subresource Integrity (SRI) checks.',
    severity: 'medium',
    fileTypes: ['html', 'php', 'jsp', 'aspx'],
    patterns: [
      // Script tags without integrity attribute
      '<script[^>]*src=[\'"`]https?://[^\'"`]+[\'"`][^>]*>',
      // Link tags without integrity attribute
      '<link[^>]*href=[\'"`]https?://[^\'"`]+\\.css[\'"`][^>]*>',
    ],
    remediation: 'Add integrity and crossorigin attributes to script and link tags that load external resources. Generate SRI hashes using tools like srihash.org or the SRI Hash Generator plugin. Consider hosting critical scripts locally when possible.',
  },
  {
    id: 'A08:2021-003',
    title: 'Unsigned Code or Updates',
    category: 'A08:2021 - Software and Data Integrity Failures',
    description: 'Code or updates that are not cryptographically signed, allowing potential tampering.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Auto-update mechanisms
      'download\\([\'"`]https?://[^\'"`]+[\'"`]\\)',
      'fetch\\([\'"`]https?://[^\'"`]+[\'"`]\\)',
      'wget\\([\'"`]https?://[^\'"`]+[\'"`]\\)',
      // Plugin/extension loading
      'require\\([\'"`]https?://[^\'"`]+[\'"`]\\)',
      'import\\([\'"`]https?://[^\'"`]+[\'"`]\\)',
      'load\\([\'"`]https?://[^\'"`]+[\'"`]\\)',
    ],
    remediation: 'Implement code signing for all deployable artifacts. Verify signatures before executing downloaded code. Use package managers that support signature verification. Implement secure update mechanisms that validate the integrity of updates before applying them.',
  },
];