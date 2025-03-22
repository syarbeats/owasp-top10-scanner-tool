/**
 * File Analyzer Module
 * Analyzes files for OWASP Top Ten vulnerabilities
 */

const path = require('path');

/**
 * Analyze a file for vulnerabilities
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {Array<Object>} rules - Rules to check
 * @returns {Array<Object>} Found vulnerabilities
 */
async function analyzeFile(filePath, content, rules) {
  const fileExt = path.extname(filePath).toLowerCase();
  const fileType = getFileType(fileExt);
  const lines = content.split('\n');
  const vulnerabilities = [];

  // Only analyze files with supported file types
  if (!fileType) {
    return [];
  }

  // Apply rules that are applicable to this file type
  for (const rule of rules) {
    // Skip rules that don't apply to this file type
    if (rule.fileTypes && !rule.fileTypes.includes(fileType)) {
      continue;
    }

    try {
      const ruleVulnerabilities = await applyRule(rule, filePath, content, lines, fileType);
      vulnerabilities.push(...ruleVulnerabilities);
    } catch (error) {
      console.error(`Error applying rule ${rule.id} to ${filePath}: ${error.message}`);
    }
  }

  return vulnerabilities;
}

/**
 * Apply a rule to a file
 * @param {Object} rule - Rule to apply
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {Array<string>} lines - File content split by lines
 * @param {string} fileType - File type
 * @returns {Array<Object>} Found vulnerabilities
 */
async function applyRule(rule, filePath, content, lines, fileType) {
  const vulnerabilities = [];

  // If the rule has a pattern, check for pattern matches
  if (rule.patterns) {
    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern, 'g');
      let match;

      // For line-by-line patterns
      if (rule.lineByLine) {
        lines.forEach((line, lineNumber) => {
          const lineRegex = new RegExp(pattern);
          if (lineRegex.test(line)) {
            vulnerabilities.push({
              ruleId: rule.id,
              category: rule.category,
              title: rule.title,
              description: rule.description,
              severity: rule.severity,
              line: lineNumber + 1,
              column: line.search(lineRegex) + 1,
              snippet: line.trim(),
              remediation: rule.remediation,
            });
          }
        });
      } 
      // For whole file patterns
      else {
        while ((match = regex.exec(content)) !== null) {
          // Calculate line and column number
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          const lastNewlineIndex = beforeMatch.lastIndexOf('\n');
          const column = lastNewlineIndex === -1 ? match.index + 1 : match.index - lastNewlineIndex;
          
          // Get the line containing the match
          const line = lines[lineNumber - 1];
          
          vulnerabilities.push({
            ruleId: rule.id,
            category: rule.category,
            title: rule.title,
            description: rule.description,
            severity: rule.severity,
            line: lineNumber,
            column,
            snippet: line.trim(),
            remediation: rule.remediation,
          });
        }
      }
    }
  }

  // If the rule has a custom check function, run it
  if (rule.check && typeof rule.check === 'function') {
    try {
      const customVulnerabilities = await rule.check(filePath, content, lines, fileType);
      vulnerabilities.push(...customVulnerabilities);
    } catch (error) {
      console.error(`Error in custom check for rule ${rule.id}: ${error.message}`);
    }
  }

  return vulnerabilities;
}

/**
 * Get file type based on extension
 * @param {string} ext - File extension
 * @returns {string|null} File type or null if not supported
 */
function getFileType(ext) {
  const fileTypeMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'css',
    '.less': 'css',
    '.php': 'php',
    '.py': 'python',
    '.rb': 'ruby',
    '.java': 'java',
    '.go': 'go',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.sql': 'sql',
  };

  return fileTypeMap[ext] || null;
}

module.exports = {
  analyzeFile,
};