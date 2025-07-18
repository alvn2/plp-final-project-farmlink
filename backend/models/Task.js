const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Associated crop is required']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Completed', 'Overdue'],
      message: 'Status must be Pending, Completed, or Overdue'
    },
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual field for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual field to check if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed') return false;
  return new Date() > new Date(this.dueDate);
});

// Update completedAt when status changes to Completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status === 'Pending') {
      this.completedAt = undefined;
    }
  }
  next();
});

// Include virtuals when converting to JSON
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
