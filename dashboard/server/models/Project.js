/**
 * Project Model
 * Represents a project in the system
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for getting all scans for this project
ProjectSchema.virtual('scans', {
  ref: 'Scan',
  localField: '_id',
  foreignField: 'projectId'
});

// Method to check if a user is a member of the project
ProjectSchema.methods.isMember = function(userId) {
  return (
    this.owner.equals(userId) || 
    this.team.some(member => member.equals(userId))
  );
};

module.exports = mongoose.model('Project', ProjectSchema);