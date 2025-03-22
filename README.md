# OWASP Top Ten Scanner

A command-line tool for scanning applications for OWASP Top Ten vulnerabilities.

## Features

- Scans projects for potential OWASP Top Ten vulnerabilities
- Supports multiple file types (JavaScript, TypeScript, HTML, CSS, PHP, Python, Java, etc.)
- Provides detailed vulnerability reports with locations and remediation suggestions
- Configurable rule sets and exclusion patterns
- JSON, text, and HTML output formats

## Installation

```bash
# Clone the repository
git clone https://github.com/owasp-scanner/owasp-scanner.git
cd owasp-scanner

# Install dependencies
npm install

# Make the CLI executable
npm run prepare
```

## Usage

### Scanning a Project

```bash
# Basic scan
node index.js scan /path/to/project

# Scan with specific output format
node index.js scan /path/to/project --output json

# Scan with custom configuration
node index.js scan /path/to/project --config /path/to/config.json

# Scan in offline mode (without sending results to dashboard)
node index.js scan /path/to/project --offline
```

### Initializing Configuration

```bash
# Initialize default configuration
node index.js init

# Force overwrite existing configuration
node index.js init --force
```

### Help

```bash
# Show help
node index.js --help

# Show help for a specific command
node index.js scan --help
```

## OWASP Top Ten Categories

The scanner checks for vulnerabilities in the following OWASP Top Ten 2021 categories:

1. **A01:2021 – Broken Access Control**
   - Missing access control checks
   - Insecure direct object references (IDOR)
   - Cross-origin resource sharing (CORS) misconfiguration
   - Missing function level access control
   - JWT without signature verification

2. **A02:2021 – Cryptographic Failures**
   - Weak cryptographic algorithms
   - Hardcoded secrets
   - Insufficient key length
   - Insecure random number generation
   - Missing TLS configuration

3. **A03:2021 – Injection**
   - SQL injection
   - NoSQL injection
   - Command injection
   - Cross-site scripting (XSS)
   - XML injection (XXE)

4. **A04:2021 – Insecure Design**
   - Missing rate limiting
   - Lack of input validation

5. **A05:2021 – Security Misconfiguration**
   - Default or weak credentials
   - Verbose error messages

6. **A06:2021 – Vulnerable and Outdated Components**
   - Outdated package manager files
   - Vulnerable JavaScript libraries

7. **A07:2021 – Identification and Authentication Failures**
   - Weak password requirements
   - Missing multi-factor authentication
   - Insecure session management

8. **A08:2021 – Software and Data Integrity Failures**
   - Insecure deserialization
   - Missing subresource integrity
   - Unsigned code or updates

9. **A09:2021 – Security Logging and Monitoring Failures**
   - Insufficient logging
   - Sensitive data in logs
   - Missing audit trails

10. **A10:2021 – Server-Side Request Forgery (SSRF)**
    - Unvalidated URL in server-side request
    - Server-side request to internal resources
    - XML/document parsers with external entity resolution

## Configuration

The scanner can be configured using a JSON configuration file. The default configuration file is located at `~/.owasp-scanner/config.json`.

Example configuration:

```json
{
  "apiUrl": "http://localhost:3000/api",
  "debug": false,
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".git/**",
    "**/*.min.js"
  ],
  "rules": {
    // Rule-specific configuration
  }
}
```

## Dashboard Integration

The scanner can send results to a dashboard for visualization and tracking. The dashboard provides the following features:

- **Project Management**: Create and manage projects for scanning
- **Scan History**: View scan history and track vulnerabilities over time
- **Vulnerability Management**: Track, assign, and update vulnerability status
- **Visualization**: Interactive charts and graphs for vulnerability analysis
- **Team Collaboration**: Invite team members to collaborate on projects

### Setting Up Dashboard Integration

1. Start the dashboard:
   ```bash
   cd dashboard
   npm run install-all
   npm start
   ```

2. Initialize the CLI scanner configuration:
   ```bash
   node index.js init
   ```

3. Follow the prompts to configure the dashboard URL, login credentials, and project selection.

4. Run scans with dashboard integration:
   ```bash
   node index.js scan /path/to/project
   ```

For more information about the dashboard, see the [Dashboard README](./dashboard/README.md).

## License

MIT