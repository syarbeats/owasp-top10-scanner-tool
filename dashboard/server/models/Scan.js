/**
 * Scan Model
 * Represents a scan performed on a project
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScanSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  scannerVersion: {
    type: String,
    required: true
  },
  summary: {
    totalFiles: {
      type: Number,
      required: true
    },
    filesScanned: {
      type: Number,
      required: true
    },
    vulnerabilitiesFound: {
      type: Number,
      required: true
    },
    categories: {
      "A01:2021": { type: Number, default: 0 },
      "A02:2021": { type: Number, default: 0 },
      "A03:2021": { type: Number, default: 0 },
      "A04:2021": { type: Number, default: 0 },
      "A05:2021": { type: Number, default: 0 },
      "A06:2021": { type: Number, default: 0 },
      "A07:2021": { type: Number, default: 0 },
      "A08:2021": { type: Number, default: 0 },
      "A09:2021": { type: Number, default: 0 },
      "A10:2021": { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'in-progress'],
    default: 'completed'
  },
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

// Virtual for getting all vulnerabilities for this scan
ScanSchema.virtual('vulnerabilities', {
  ref: 'Vulnerability',
  localField: '_id',
  foreignField: 'scanId'
});

// Method to update vulnerability counts by category
ScanSchema.methods.updateCategoryCounts = async function() {
  const Vulnerability = mongoose.model('Vulnerability');
  
  // Get counts by category
  const categoryCounts = await Vulnerability.aggregate([
    { $match: { scanId: this._id } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  // Reset all category counts
  for (const key in this.summary.categories) {
    this.summary.categories[key] = 0;
  }
  
  // Update with new counts
  categoryCounts.forEach(category => {
    if (this.summary.categories.hasOwnProperty(category._id)) {
      this.summary.categories[category._id] = category.count;
    }
  });
  
  // Update total count
  this.summary.vulnerabilitiesFound = await Vulnerability.countDocuments({ scanId: this._id });
  
  return this.save();
};

module.exports = mongoose.model('Scan', ScanSchema);