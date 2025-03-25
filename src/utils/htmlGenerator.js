/**
 * Generate HTML report from scan results
 * @param {Object} results - Scan results 
 * @returns {string} HTML content
 */
function generateHtmlReport(results) {
  const vulnerabilityRows = results.vulnerabilities.map(vuln => `
    <tr>
      <td>${escapeHtml(vuln.ruleId)}</td>
      <td>${escapeHtml(vuln.severity)}</td>
      <td>${escapeHtml(vuln.location)}</td>
      <td>${escapeHtml(vuln.message)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OWASP Top 10 Scan Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .high {
            color: #dc3545;
        }
        .medium {
            color: #ffc107;
        }
        .low {
            color: #28a745;
        }
        .header {
            margin-bottom: 30px;
        }
        .header h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OWASP Top 10 Scan Results</h1>
            <div class="timestamp">Generated on: ${new Date(results.summary.timestamp).toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <h2>Scan Summary</h2>
            <p><strong>Project Path:</strong> ${escapeHtml(results.summary.projectPath)}</p>
            <p><strong>Files Scanned:</strong> ${results.summary.filesScanned}</p>
            <p><strong>Vulnerabilities Found:</strong> ${results.summary.vulnerabilitiesFound}</p>
        </div>

        <h2>Detected Vulnerabilities</h2>
        ${results.vulnerabilities.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Rule ID</th>
                    <th>Severity</th>
                    <th>Location</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${vulnerabilityRows}
            </tbody>
        </table>
        ` : '<p>No vulnerabilities detected.</p>'}
    </div>
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (text === null || text === undefined) {
    return '';
  }
  // Convert to string in case it's a number or other type
  text = String(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  generateHtmlReport
};