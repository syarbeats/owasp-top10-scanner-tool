/**
 * Projects Routes
 * Routes for project management
 */

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Project, Scan, Vulnerability } = require('../models');
const { authenticate, isProjectMember, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Find projects where user is owner or team member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    }).populate('owner', 'username email');

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', [
  authenticate,
  // Validation
  check('name', 'Name is required').not().isEmpty(),
  check('name', 'Name must be less than 100 characters').isLength({ max: 100 }),
  check('description', 'Description must be less than 500 characters').optional().isLength({ max: 500 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    // Create new project
    const project = new Project({
      name,
      description,
      owner: req.user.id
    });

    // Save project to database
    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', [authenticate, isProjectMember], async (req, res) => {
  try {
    // Project is already attached to req by the isProjectMember middleware
    const project = req.project;
    
    // Populate owner and team members
    await project.populate('owner', 'username email');
    await project.populate('team', 'username email');
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', [
  authenticate,
  isProjectMember,
  // Validation
  check('name', 'Name must be less than 100 characters').optional().isLength({ max: 100 }),
  check('description', 'Description must be less than 500 characters').optional().isLength({ max: 500 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;
  const updateFields = {};

  // Only add fields that were provided
  if (name) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;

  try {
    // Check if user is project owner
    if (!req.project.owner.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can update project details' });
    }

    // Update project
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', [authenticate, isProjectMember], async (req, res) => {
  try {
    // Check if user is project owner or admin
    if (!req.project.owner.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can delete project' });
    }

    // Get all scans for this project
    const scans = await Scan.find({ projectId: req.params.id });
    
    // Delete all vulnerabilities for all scans
    for (const scan of scans) {
      await Vulnerability.deleteMany({ scanId: scan._id });
    }
    
    // Delete all scans
    await Scan.deleteMany({ projectId: req.params.id });
    
    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/projects/:id/team
 * @desc    Add user to project team
 * @access  Private
 */
router.post('/:id/team', [
  authenticate,
  isProjectMember,
  // Validation
  check('email', 'Valid email is required').isEmail()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Check if user is project owner
    if (!req.project.owner.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can add team members' });
    }

    // Find user by email
    const { User } = require('../models');
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already in team
    if (req.project.team.includes(user.id) || req.project.owner.equals(user.id)) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    // Add user to team
    req.project.team.push(user.id);
    await req.project.save();

    // Populate team members
    await req.project.populate('team', 'username email');

    res.json(req.project);
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/projects/:id/team/:userId
 * @desc    Remove user from project team
 * @access  Private
 */
router.delete('/:id/team/:userId', [authenticate, isProjectMember], async (req, res) => {
  try {
    // Check if user is project owner
    if (!req.project.owner.equals(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project owner can remove team members' });
    }

    // Check if user is in team
    if (!req.project.team.includes(req.params.userId)) {
      return res.status(400).json({ message: 'User is not a team member' });
    }

    // Remove user from team
    req.project.team = req.project.team.filter(
      userId => userId.toString() !== req.params.userId
    );
    
    await req.project.save();

    // Populate team members
    await req.project.populate('team', 'username email');

    res.json(req.project);
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/:id/scans
 * @desc    Get all scans for a project
 * @access  Private
 */
router.get('/:id/scans', [authenticate, isProjectMember], async (req, res) => {
  try {
    const scans = await Scan.find({ projectId: req.params.id })
      .sort({ createdAt: -1 });
    
    res.json(scans);
  } catch (error) {
    console.error('Get project scans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/projects/:id/vulnerabilities
 * @desc    Get all vulnerabilities for a project
 * @access  Private
 */
router.get('/:id/vulnerabilities', [authenticate, isProjectMember], async (req, res) => {
  try {
    // Get all scans for this project
    const scans = await Scan.find({ projectId: req.params.id });
    const scanIds = scans.map(scan => scan._id);
    
    // Get vulnerabilities for all scans
    const vulnerabilities = await Vulnerability.find({ scanId: { $in: scanIds } })
      .sort({ severity: 1, createdAt: -1 });
    
    res.json(vulnerabilities);
  } catch (error) {
    console.error('Get project vulnerabilities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;