/**
 * Scans Routes
 * Routes for scan management
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { Scan, Project, Vulnerability } = require('../models');
const { authenticate, isProjectMember } = require('../middleware/auth');

/**
 * @route   POST /api/scans
 * @desc    Create a new scan
 * @access  Private
 */
router.post('/', [
  authenticate,
  // Validation
  check('projectId', 'Project ID is required').not().isEmpty(),
  check('scannerVersion', 'Scanner version is required').not().isEmpty(),
  check('summary', 'Summary is required').not().isEmpty(),
  check('summary.totalFiles', 'Total files is required').isNumeric(),
  check('summary.filesScanned', 'Files scanned is required').isNumeric(),
  check('summary.vulnerabilitiesFound', 'Vulnerabilities found is required').isNumeric()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { projectId, scannerVersion, summary, vulnerabilities } = req.body;

  try {
    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (!project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to add scans to this project' });
    }

    // Create new scan
    const scan = new Scan({
      projectId,
      scannerVersion,
      summary,
      status: 'completed'
    });

    // Save scan to database
    const savedScan = await scan.save();

    // If vulnerabilities are provided, add them
    if (vulnerabilities && Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
      const vulnerabilityDocs = vulnerabilities.map(vuln => ({
        ...vuln,
        scanId: savedScan._id
      }));
      
      await Vulnerability.insertMany(vulnerabilityDocs);
      
      // Update category counts
      await savedScan.updateCategoryCounts();
    }

    res.status(201).json(savedScan);
  } catch (error) {
    console.error('Create scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/scans/:id
 * @desc    Get scan by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }
    
    // Check if user is a project member
    const project = await Project.findById(scan.projectId);
    
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this scan' });
    }
    
    res.json(scan);
  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/scans/:id
 * @desc    Delete scan
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }
    
    // Check if user is a project member
    const project = await Project.findById(scan.projectId);
    
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this scan' });
    }
    
    // Delete all vulnerabilities for this scan
    await Vulnerability.deleteMany({ scanId: scan._id });
    
    // Delete scan
    await scan.remove();
    
    res.json({ message: 'Scan deleted' });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/scans/:id/vulnerabilities
 * @desc    Get all vulnerabilities for a scan
 * @access  Private
 */
router.get('/:id/vulnerabilities', authenticate, async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }
    
    // Check if user is a project member
    const project = await Project.findById(scan.projectId);
    
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view vulnerabilities for this scan' });
    }
    
    // Get vulnerabilities for this scan
    const vulnerabilities = await Vulnerability.find({ scanId: scan._id })
      .sort({ severity: 1, category: 1 });
    
    res.json(vulnerabilities);
  } catch (error) {
    console.error('Get scan vulnerabilities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/scans/stats/overview
 * @desc    Get overview statistics for all scans
 * @access  Private
 */
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    // Get projects where user is a member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    });
    
    const projectIds = projects.map(project => project._id);
    
    // Get scan statistics
    const scanStats = await Scan.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: {
        _id: null,
        totalScans: { $sum: 1 },
        totalVulnerabilities: { $sum: '$summary.vulnerabilitiesFound' },
        avgVulnerabilities: { $avg: '$summary.vulnerabilitiesFound' },
        categories: {
          $push: '$summary.categories'
        }
      }}
    ]);
    
    // Get vulnerability statistics by severity
    const vulnerabilityStats = await Vulnerability.aggregate([
      { $match: { scanId: { $in: await Scan.find({ projectId: { $in: projectIds } }).distinct('_id') } } },
      { $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Process category statistics
    let categoryStats = {};
    if (scanStats.length > 0 && scanStats[0].categories) {
      scanStats[0].categories.forEach(category => {
        Object.entries(category).forEach(([key, value]) => {
          if (!categoryStats[key]) {
            categoryStats[key] = 0;
          }
          categoryStats[key] += value;
        });
      });
    }
    
    res.json({
      scanStats: scanStats.length > 0 ? {
        totalScans: scanStats[0].totalScans,
        totalVulnerabilities: scanStats[0].totalVulnerabilities,
        avgVulnerabilities: scanStats[0].avgVulnerabilities
      } : {
        totalScans: 0,
        totalVulnerabilities: 0,
        avgVulnerabilities: 0
      },
      vulnerabilityStats: vulnerabilityStats,
      categoryStats: Object.entries(categoryStats).map(([category, count]) => ({
        category,
        count
      }))
    });
  } catch (error) {
    console.error('Get scan statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;