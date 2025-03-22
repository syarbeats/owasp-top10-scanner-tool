/**
 * Cryptographic Failures Rules
 * Rules for detecting cryptographic failures vulnerabilities (OWASP Top Ten A02:2021)
 */

module.exports = [
  {
    id: 'A02:2021-001',
    title: 'Weak Cryptographic Algorithms',
    category: 'A02:2021 - Cryptographic Failures',
    description: 'Use of cryptographically weak algorithms that may be susceptible to attacks.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'go', 'ruby'],
    patterns: [
      // MD5
      'createHash\\([\'"`]md5[\'"`]\\)',
      'MD5\\(',
      'md5\\(',
      'Digest::MD5',
      // SHA1
      'createHash\\([\'"`]sha1[\'"`]\\)',
      'SHA1\\(',
      'sha1\\(',
      'Digest::SHA1',
      // RC4
      'createCipheriv\\([\'"`]rc4[\'"`]',
      'RC4\\(',
      // DES
      'createCipheriv\\([\'"`]des[\'"`]',
      'createCipheriv\\([\'"`]des-cbc[\'"`]',
      'DES\\(',
      // 3DES
      'createCipheriv\\([\'"`]des3[\'"`]',
      'createCipheriv\\([\'"`]des-ede3[\'"`]',
      'TripleDES\\(',
    ],
    remediation: 'Use strong, modern cryptographic algorithms. Replace MD5 and SHA1 with SHA-256 or SHA-3. Replace DES and 3DES with AES-256. Replace RC4 with ChaCha20-Poly1305 or AES-GCM.',
  },
  {
    id: 'A02:2021-002',
    title: 'Hardcoded Secrets',
    category: 'A02:2021 - Cryptographic Failures',
    description: 'Hardcoded credentials, API keys, or cryptographic keys in source code.',
    severity: 'critical',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'go', 'ruby', 'c', 'cpp', 'csharp'],
    patterns: [
      // API keys
      'api[_-]?key[\'"`]?\\s*[:=]\\s*[\'"`][A-Za-z0-9]{16,}[\'"`]',
      'apikey[\'"`]?\\s*[:=]\\s*[\'"`][A-Za-z0-9]{16,}[\'"`]',
      'api[_-]?secret[\'"`]?\\s*[:=]\\s*[\'"`][A-Za-z0-9]{16,}[\'"`]',
      // AWS
      'aws[_-]?access[_-]?key[_-]?id[\'"`]?\\s*[:=]\\s*[\'"`][A-Z0-9]{20}[\'"`]',
      'aws[_-]?secret[_-]?access[_-]?key[\'"`]?\\s*[:=]\\s*[\'"`][A-Za-z0-9/+]{40}[\'"`]',
      // Database credentials
      'password[\'"`]?\\s*[:=]\\s*[\'"`][^\'"`]{8,}[\'"`]',
      'passwd[\'"`]?\\s*[:=]\\s*[\'"`][^\'"`]{8,}[\'"`]',
      'pwd[\'"`]?\\s*[:=]\\s*[\'"`][^\'"`]{8,}[\'"`]',
      // JWT secrets
      'jwt[_-]?secret[\'"`]?\\s*[:=]\\s*[\'"`][^\'"`]{8,}[\'"`]',
      'secret[_-]?key[\'"`]?\\s*[:=]\\s*[\'"`][^\'"`]{8,}[\'"`]',
    ],
    remediation: 'Store secrets in environment variables, a secure vault, or a secrets management service. Never hardcode credentials in source code. Use configuration files that are not checked into version control or use environment-specific configuration.',
  },
  {
    id: 'A02:2021-003',
    title: 'Insufficient Key Length',
    category: 'A02:2021 - Cryptographic Failures',
    description: 'Use of cryptographic keys with insufficient length, making them vulnerable to brute force attacks.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'go', 'ruby'],
    patterns: [
      // RSA with small key size
      'generateKeyPair\\([\'"`]rsa[\'"`]\\s*,\\s*{\\s*modulusLength:\\s*(?:512|1024)\\s*',
      'RSA\\.generate\\((?:512|1024)\\)',
      // DSA with small key size
      'generateKeyPair\\([\'"`]dsa[\'"`]\\s*,\\s*{\\s*modulusLength:\\s*(?:512|1024)\\s*',
      'DSA\\.generate\\((?:512|1024)\\)',
      // ECC with small curves
      'generateKeyPair\\([\'"`]ec[\'"`]\\s*,\\s*{\\s*namedCurve:\\s*[\'"`](?:secp112r1|secp128r1)[\'"`]\\s*',
      'EC\\.generate\\([\'"`](?:secp112r1|secp128r1)[\'"`]\\)',
    ],
    remediation: 'Use appropriate key lengths for cryptographic algorithms: at least 2048 bits for RSA and DSA, and 256 bits for ECC. Follow NIST guidelines for key management and cryptographic algorithm selection.',
  },
  {
    id: 'A02:2021-004',
    title: 'Insecure Random Number Generation',
    category: 'A02:2021 - Cryptographic Failures',
    description: 'Use of non-cryptographically secure random number generators for security-sensitive operations.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'go', 'ruby'],
    patterns: [
      // JavaScript/Node.js
      'Math\\.random\\(\\)',
      'Math\\.floor\\(\\s*Math\\.random\\(\\)',
      // Java
      'java\\.util\\.Random',
      // PHP
      'rand\\(',
      'mt_rand\\(',
      'array_rand\\(',
      // Python
      'random\\.random\\(',
      'random\\.randint\\(',
      'random\\.choice\\(',
      // Ruby
      'rand\\(',
      'Random\\.rand\\(',
    ],
    remediation: 'Use cryptographically secure random number generators: crypto.randomBytes() in Node.js, java.security.SecureRandom in Java, random.SystemRandom in Python, SecureRandom in Ruby, and openssl_random_pseudo_bytes() in PHP.',
  },
  {
    id: 'A02:2021-005',
    title: 'Missing TLS Configuration',
    category: 'A02:2021 - Cryptographic Failures',
    description: 'Applications that do not enforce TLS or use insecure TLS configurations.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby', 'html'],
    patterns: [
      // HTTP URLs in code
      'http://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      'http://localhost',
      'http://127\\.0\\.0\\.1',
      // Insecure TLS configurations
      'rejectUnauthorized:\\s*false',
      'NODE_TLS_REJECT_UNAUTHORIZED\\s*=\\s*[\'"`]?0[\'"`]?',
      'verify=False',
      'VERIFY_NONE',
      'ssl_verify=False',
      // HTML forms with HTTP action
      '<form[^>]*action=[\'"`]http://',
    ],
    remediation: 'Always use HTTPS for production environments. Configure TLS properly with modern protocols (TLS 1.2+) and strong cipher suites. Enable HSTS headers. Never disable certificate validation in production code.',
  },
];