/**
 * Rules Module
 * Defines rules for detecting OWASP Top Ten vulnerabilities
 */

const fs = require('fs');
const path = require('path');

// Import rule categories
const brokenAccessControl = require('./broken-access-control');
const cryptographicFailures = require('./cryptographic-failures');
const injection = require('./injection');
const insecureDesign = require('./insecure-design');
const securityMisconfiguration = require('./security-misconfiguration');
const vulnerableComponents = require('./vulnerable-components');
const authenticationFailures = require('./authentication-failures');
const integrityFailures = require('./integrity-failures');
const loggingFailures = require('./logging-failures');
const ssrf = require('./ssrf');

/**
 * Get all rules for OWASP Top Ten categories
 * @returns {Array<Object>} All rules
 */
function getAllRules() {
  return [
    ...brokenAccessControl,
    ...cryptographicFailures,
    ...injection,
    ...insecureDesign,
    ...securityMisconfiguration,
    ...vulnerableComponents,
    ...authenticationFailures,
    ...integrityFailures,
    ...loggingFailures,
    ...ssrf,
  ];
}

/**
 * Get rules for a specific OWASP Top Ten category
 * @param {string} category - OWASP Top Ten category
 * @returns {Array<Object>} Rules for the specified category
 */
function getRulesByCategory(category) {
  const allRules = getAllRules();
  return allRules.filter(rule => rule.category === category);
}

/**
 * Get rule by ID
 * @param {string} id - Rule ID
 * @returns {Object|null} Rule object or null if not found
 */
function getRuleById(id) {
  const allRules = getAllRules();
  return allRules.find(rule => rule.id === id) || null;
}

module.exports = {
  getAllRules,
  getRulesByCategory,
  getRuleById,
  // Export categories for direct access
  categories: {
    brokenAccessControl,
    cryptographicFailures,
    injection,
    insecureDesign,
    securityMisconfiguration,
    vulnerableComponents,
    authenticationFailures,
    integrityFailures,
    loggingFailures,
    ssrf,
  },
};