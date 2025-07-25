const express = require('express');
const Task = require('../models/Task');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', auth, async(req, res) => {
  try {
    const { status, cropId, priority, search, sort = 'dueDate' } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (cropId) query.cropId = cropId;
    if (priority) query.priority = priority;
    if (search) query.description = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('cropId', 'name')
      .sort(sort);

    res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: {
        tasks
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks.'
    });
  }
});

// @route   GET /api/tasks/overdue
// @desc    Get all overdue tasks for authenticated user
// @access  Private
router.get('/overdue', auth, async(req, res) => {
  try {
    const now = new Date();
    const overdueTasks = await Task.find({
      userId: req.user._id,
      status: 'Pending',
      dueDate: { $lt: now }
    }).populate('cropId', 'name');
    res.json({
      success: true,
      data: {
        tasks: overdueTasks,
        count: overdueTasks.length
      }
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching overdue tasks.' });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics for authenticated user
// @access  Private
router.get('/stats', auth, async(req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    const totalTasks = tasks.length;
    const statusStats = {};
    const priorityStats = {};
    const categoryStats = {};
    tasks.forEach(task => {
      statusStats[task.status] = (statusStats[task.status] || 0) + 1;
      priorityStats[task.priority] = (priorityStats[task.priority] || 0) + 1;
      categoryStats[task.category] = (categoryStats[task.category] || 0) + 1;
    });
    res.json({
      success: true,
      data: {
        totalTasks,
        statusStats,
        priorityStats,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching task statistics.' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', auth, async(req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('cropId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.'
      });
    }

    res.json({
      success: true,
      message: 'Task retrieved successfully',
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Get task error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format.' });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching task.'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async(req, res) => {
  try {
    const { cropId, description, dueDate, priority = 'Medium' } = req.body;

    // Validation
    if (!cropId || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Crop, description, and due date are required.'
      });
    }

    // Verify crop belongs to user
    const crop = await Crop.findOne({
      _id: cropId,
      userId: req.user._id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found or does not belong to you'
      });
    }

    const task = new Task({
      userId: req.user._id,
      cropId,
      description: description.trim(),
      dueDate: new Date(dueDate),
      priority
    });

    await task.save();

    // Populate crop info
    await task.populate('cropId', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Create task error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating task.'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async(req, res) => {
  try {
    const { cropId, description, dueDate, status, priority } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to edit it.'
      });
    }

    // If cropId is being updated, verify it belongs to user
    if (cropId && cropId !== task.cropId.toString()) {
      const crop = await Crop.findOne({
        _id: cropId,
        userId: req.user._id
      });

      if (!crop) {
        return res.status(400).json({
          success: false,
          message: 'Invalid crop selected or you do not have permission to assign tasks to this crop.'
        });
      }

      task.cropId = cropId;
    }

    // Update fields if provided
    if (description) task.description = description.trim();
    if (dueDate) task.dueDate = new Date(dueDate);
    if (status) task.status = status;
    if (priority) task.priority = priority;

    await task.save();

    // Populate crop info
    await task.populate('cropId', 'name');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Update task error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task or crop ID format.' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating task.'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async(req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.'
      });
    }

    await Task.findByIdAndDelete(task._id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format.' });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting task.'
    });
  }
});

// @route   GET /api/tasks/upcoming/dashboard
// @desc    Get upcoming tasks for dashboard (next 7 days)
// @access  Private
router.get('/upcoming/dashboard', auth, async(req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

    const upcomingTasks = await Task.find({
      userId: req.user._id,
      status: 'Pending',
      dueDate: { $gte: now, $lte: sevenDaysFromNow }
    })
      .populate('cropId', 'name')
      .sort({ dueDate: 1 })
      .limit(5);

    // Get overdue tasks
    const overdueTasks = await Task.find({
      userId: req.user._id,
      status: 'Pending',
      dueDate: { $lt: now }
    })
      .populate('cropId', 'name')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      message: 'Upcoming tasks retrieved successfully',
      data: {
        upcomingTasks,
        overdueTasks: overdueTasks.slice(0, 5),
        counts: {
          upcoming: upcomingTasks.length,
          overdue: overdueTasks.length
        }
      }
    });

  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming tasks.'
    });
  }
});

// @route   PATCH /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.patch('/:id/complete', auth, async(req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to modify it.'
      });
    }

    task.status = 'Completed';
    task.completedAt = new Date();

    await task.save();
    await task.populate('cropId', 'name');

    res.json({
      success: true,
      message: 'Task marked as completed',
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Complete task error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid task ID format.' });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while completing task.'
    });
  }
});

module.exports = router;
