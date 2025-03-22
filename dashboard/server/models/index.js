/**
 * Models Index
 * Export all models from a single file
 */

const User = require('./User');
const Project = require('./Project');
const Scan = require('./Scan');
const Vulnerability = require('./Vulnerability');

module.exports = {
  User,
  Project,
  Scan,
  Vulnerability
};