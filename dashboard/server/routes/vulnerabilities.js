/**
 * Vulnerabilities Routes
 * Routes for vulnerability management
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Vulnerability, Scan, Project } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/vulnerabilities
 * @desc    Get all vulnerabilities for projects where user is a member
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Get projects where user is a member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    });
    
    const projectIds = projects.map(project => project._id);
    
    // Get scans for these projects
    const scanIds = await Scan.find({ projectId: { $in: projectIds } }).distinct('_id');
    
    // Get vulnerabilities for these scans
    const vulnerabilities = await Vulnerability.find({ scanId: { $in: scanIds } })
      .populate({
        path: 'scanId',
        select: 'projectId createdAt',
        populate: {
          path: 'projectId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    // Transform vulnerabilities to include project info
    const transformedVulnerabilities = vulnerabilities.map(vuln => ({
      ...vuln.toObject(),
      projectName: vuln.scanId.projectId.name,
      projectId: vuln.scanId.projectId._id
    }));
    
    res.json(transformedVulnerabilities);
  } catch (error) {
    console.error('Get all vulnerabilities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/vulnerabilities/:id
 * @desc    Get vulnerability by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const vulnerability = await Vulnerability.findById(req.params.id);
    
    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }
    
    // Check if user is authorized to view this vulnerability
    const scan = await Scan.findById(vulnerability.scanId);
    
    if (!scan) {
      return res.status(404).json({ message: 'Associated scan not found' });
    }
    
    const project = await Project.findById(scan.projectId);
    
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view this vulnerability' });
    }
    
    res.json(vulnerability);
  } catch (error) {
    console.error('Get vulnerability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/vulnerabilities/:id
 * @desc    Update vulnerability status
 * @access  Private
 */
router.put('/:id', [
  authenticate,
  // Validation
  check('status', 'Status is required').isIn(['open', 'fixed', 'false-positive', 'ignored'])
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, assignedTo } = req.body;

  try {
    const vulnerability = await Vulnerability.findById(req.params.id);
    
    if (!vulnerability) {
      return res.status(404).json({ message: 'Vulnerability not found' });
    }
    
    // Check if user is authorized to update this vulnerability
    const scan = await Scan.findById(vulnerability.scanId);
    
    if (!scan) {
      return res.status(404).json({ message: 'Associated scan not found' });
    }
    
    const project = await Project.findById(scan.projectId);
    
    if (!project || !project.isMember(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this vulnerability' });
    }
    
    // Update vulnerability
    vulnerability.status = status;
    
    if (assignedTo) {
      // Check if assignedTo is a project member
      if (!project.isMember(assignedTo)) {
        return res.status(400).json({ message: 'Assigned user must be a project member' });
      }
      
      vulnerability.assignedTo = assignedTo;
    }
    
    await vulnerability.save();
    
    res.json(vulnerability);
  } catch (error) {
    console.error('Update vulnerability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/vulnerabilities/stats/by-category
 * @desc    Get vulnerability statistics by category
 * @access  Private
 */
router.get('/stats/by-category', authenticate, async (req, res) => {
  try {
    // Get projects where user is a member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    });
    
    const projectIds = projects.map(project => project._id);
    
    // Get scans for these projects
    const scanIds = await Scan.find({ projectId: { $in: projectIds } }).distinct('_id');
    
    // Get vulnerability statistics by category
    const stats = await Vulnerability.aggregate([
      { $match: { scanId: { $in: scanIds } } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        fixed: { $sum: { $cond: [{ $eq: ['$status', 'fixed'] }, 1, 0] } },
        falsePositive: { $sum: { $cond: [{ $eq: ['$status', 'false-positive'] }, 1, 0] } },
        ignored: { $sum: { $cond: [{ $eq: ['$status', 'ignored'] }, 1, 0] } },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
        low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } },
        info: { $sum: { $cond: [{ $eq: ['$severity', 'info'] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Get vulnerability statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/vulnerabilities/stats/by-severity
 * @desc    Get vulnerability statistics by severity
 * @access  Private
 */
router.get('/stats/by-severity', authenticate, async (req, res) => {
  try {
    // Get projects where user is a member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    });
    
    const projectIds = projects.map(project => project._id);
    
    // Get scans for these projects
    const scanIds = await Scan.find({ projectId: { $in: projectIds } }).distinct('_id');
    
    // Get vulnerability statistics by severity
    const stats = await Vulnerability.aggregate([
      { $match: { scanId: { $in: scanIds } } },
      { $group: {
        _id: '$severity',
        count: { $sum: 1 },
        open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        fixed: { $sum: { $cond: [{ $eq: ['$status', 'fixed'] }, 1, 0] } },
        falsePositive: { $sum: { $cond: [{ $eq: ['$status', 'false-positive'] }, 1, 0] } },
        ignored: { $sum: { $cond: [{ $eq: ['$status', 'ignored'] }, 1, 0] } }
      }},
      { $sort: { 
        _id: 1
      }}
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Get vulnerability statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/vulnerabilities/stats/trend
 * @desc    Get vulnerability trend over time
 * @access  Private
 */
router.get('/stats/trend', authenticate, async (req, res) => {
  try {
    // Get projects where user is a member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    });
    
    const projectIds = projects.map(project => project._id);
    
    // Get scans for these projects
    const scans = await Scan.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: 1 });
    
    // Prepare trend data
    const trendData = [];
    
    for (const scan of scans) {
      // Get vulnerability counts for this scan
      const vulnerabilityCounts = await Vulnerability.aggregate([
        { $match: { scanId: scan._id } },
        { $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }}
      ]);
      
      // Create trend data point
      const dataPoint = {
        date: scan.createdAt,
        scanId: scan._id,
        projectId: scan.projectId,
        total: scan.summary.vulnerabilitiesFound,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      };
      
      // Add severity counts
      vulnerabilityCounts.forEach(count => {
        if (dataPoint.hasOwnProperty(count._id)) {
          dataPoint[count._id] = count.count;
        }
      });
      
      trendData.push(dataPoint);
    }
    
    res.json(trendData);
  } catch (error) {
    console.error('Get vulnerability trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;