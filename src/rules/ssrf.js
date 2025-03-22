/**
 * Server-Side Request Forgery (SSRF) Rules
 * Rules for detecting SSRF vulnerabilities (OWASP Top Ten A10:2021)
 */

module.exports = [
  {
    id: 'A10:2021-001',
    title: 'Unvalidated URL in Server-Side Request',
    category: 'A10:2021 - Server-Side Request Forgery',
    description: 'Server-side requests using user-supplied URLs without proper validation.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // Node.js HTTP requests
      'https?\\.get\\(\\s*(?:req|request)\\.(?:body|query|params)',
      'https?\\.request\\(\\s*(?:req|request)\\.(?:body|query|params)',
      'axios\\.get\\(\\s*(?:req|request)\\.(?:body|query|params)',
      'axios\\.post\\(\\s*(?:req|request)\\.(?:body|query|params)',
      'fetch\\(\\s*(?:req|request)\\.(?:body|query|params)',
      'got\\(\\s*(?:req|request)\\.(?:body|query|params)',
      'superagent\\.get\\(\\s*(?:req|request)\\.(?:body|query|params)',
      // PHP HTTP requests
      'curl_exec\\(\\s*\\$(?:_GET|_POST|_REQUEST)',
      'file_get_contents\\(\\s*\\$(?:_GET|_POST|_REQUEST)',
      // Python HTTP requests
      'requests\\.(?:get|post|put|delete)\\(\\s*(?:request\\.(?:args|form|json))',
      'urllib\\.(?:urlopen|Request)\\(\\s*(?:request\\.(?:args|form|json))',
      // Ruby HTTP requests
      'Net::HTTP\\.(?:get|post)\\(\\s*params',
      'open\\(\\s*params',
    ],
    remediation: 'Implement strict URL validation for all server-side requests. Use allowlists for domains, IP ranges, and URL schemes. Disable redirects or validate the redirect target. Consider using a URL parsing library to validate URLs properly.',
  },
  {
    id: 'A10:2021-002',
    title: 'Server-Side Request to Internal Resources',
    category: 'A10:2021 - Server-Side Request Forgery',
    description: 'Server-side requests that could be manipulated to access internal resources.',
    severity: 'critical',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // HTTP requests with URL concatenation
      'https?\\.get\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      'https?\\.request\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      'axios\\.get\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      'axios\\.post\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      'fetch\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      'got\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      'superagent\\.get\\([\'"`][^\'"`]*[\'"`]\\s*\\+\\s*',
      // Template literals in URLs
      'https?\\.get\\(`[^`]*\\${',
      'https?\\.request\\(`[^`]*\\${',
      'axios\\.get\\(`[^`]*\\${',
      'axios\\.post\\(`[^`]*\\${',
      'fetch\\(`[^`]*\\${',
      'got\\(`[^`]*\\${',
      'superagent\\.get\\(`[^`]*\\${',
    ],
    remediation: 'Use a URL parser to extract and validate components of the URL. Implement network-level protections like firewall rules to prevent outbound requests to internal resources. Consider using a proxy service for external requests that can enforce security policies.',
  },
  {
    id: 'A10:2021-003',
    title: 'XML/Document Parsers with External Entity Resolution',
    category: 'A10:2021 - Server-Side Request Forgery',
    description: 'XML parsers with external entity resolution enabled, which can lead to SSRF via XXE.',
    severity: 'high',
    fileTypes: ['javascript', 'typescript', 'php', 'python', 'java', 'ruby'],
    patterns: [
      // JavaScript/Node.js XML parsers
      'libxmljs\\.parseXml\\(',
      'xml2js\\.parseString\\(',
      // Java XML parsers
      'DocumentBuilderFactory\\.newInstance\\(\\)',
      'SAXParserFactory\\.newInstance\\(\\)',
      'XMLInputFactory\\.newInstance\\(\\)',
      'TransformerFactory\\.newInstance\\(\\)',
      'SAXBuilder\\(',
      // PHP XML parsers
      'simplexml_load_',
      'DOMDocument\\(\\)',
      // Python XML parsers
      'etree\\.parse\\(',
      'minidom\\.parse\\(',
      'sax\\.parse\\(',
      'xmlrpc\\.client\\(',
    ],
    remediation: 'Disable external entity resolution in XML parsers. Set the appropriate flags for your XML parser to prevent XXE attacks. For example, set FEATURE_SECURE_PROCESSING to true in Java, or use defusedxml in Python. Consider using JSON instead of XML when possible.',
  },
];