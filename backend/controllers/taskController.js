const Task = require('../models/Task');
const Crop = require('../models/Crop');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { dbLogger } = require('../middleware/logger');

// Get all tasks for authenticated user
const getTasks = catchAsync(async(req, res, _next) => {
  const userId = req.user._id;
  const {
    status,
    priority,
    category,
    cropId,
    page = 1,
    limit = 10,
    sortBy = 'dueDate',
    sortOrder = 'asc',
    search
  } = req.query;

  // Build query
  const query = { userId };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (cropId) query.cropId = cropId;

  // Add search functionality
  if (search) {
    query.description = { $regex: search, $options: 'i' };
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const startTime = Date.now();
  const tasks = await Task.find(query)
    .populate('cropId', 'name variety status')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Task.countDocuments(query);
  const duration = Date.now() - startTime;

  dbLogger.logQuery('find', 'tasks', query, duration);

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: {
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
});

// Get single task by ID
const getTask = catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const startTime = Date.now();
  const task = await Task.findOne({ _id: id, userId })
    .populate('cropId', 'name variety status plantingDate expectedHarvestDate');
  const duration = Date.now() - startTime;

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  dbLogger.logQuery('findOne', 'tasks', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: {
      task
    }
  });
});

// Create new task
const createTask = catchAsync(async(req, res, next) => {
  const userId = req.user._id;
  const { cropId, description, dueDate, priority, category, estimatedDuration, notes } = req.body;

  // Verify that the crop belongs to the user
  const crop = await Crop.findOne({ _id: cropId, userId });
  if (!crop) {
    return next(new AppError('Crop not found or does not belong to you', 404));
  }

  // Validate due date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDueDate = new Date(dueDate);
  taskDueDate.setHours(0, 0, 0, 0);

  if (taskDueDate < today) {
    return next(new AppError('Due date cannot be in the past', 400));
  }

  const taskData = {
    userId,
    cropId,
    description,
    dueDate,
    priority,
    category,
    estimatedDuration,
    notes
  };

  const startTime = Date.now();
  const task = new Task(taskData);
  await task.save();

  // Populate the crop data
  await task.populate('cropId', 'name variety status');
  const duration = Date.now() - startTime;

  dbLogger.logQuery('create', 'tasks', taskData, duration);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      task
    }
  });
});

// Update task
const updateTask = catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  // If updating cropId, verify it belongs to the user
  if (updateData.cropId) {
    const crop = await Crop.findOne({ _id: updateData.cropId, userId });
    if (!crop) {
      return next(new AppError('Crop not found or does not belong to you', 404));
    }
  }

  // If updating due date, validate it's not in the past (unless marking as completed)
  if (updateData.dueDate && updateData.status !== 'Completed') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(updateData.dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    if (taskDueDate < today) {
      return next(new AppError('Due date cannot be in the past', 400));
    }
  }

  const startTime = Date.now();
  const task = await Task.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('cropId', 'name variety status');
  const duration = Date.now() - startTime;

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  dbLogger.logQuery('findOneAndUpdate', 'tasks', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: {
      task
    }
  });
});

// Delete task
const deleteTask = catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const startTime = Date.now();
  const task = await Task.findOneAndDelete({ _id: id, userId });
  const duration = Date.now() - startTime;

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  dbLogger.logQuery('findOneAndDelete', 'tasks', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

// Mark task as completed
const completeTask = catchAsync(async(req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { notes } = req.body;

  const startTime = Date.now();
  const task = await Task.findOneAndUpdate(
    { _id: id, userId },
    {
      status: 'Completed',
      completedAt: new Date(),
      ...(notes && { notes })
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('cropId', 'name variety status');
  const duration = Date.now() - startTime;

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  dbLogger.logQuery('findOneAndUpdate', 'tasks', { _id: id, userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Task marked as completed successfully',
    data: {
      task
    }
  });
});

// Get task analytics/statistics
const getTaskStats = catchAsync(async(req, res, _next) => {
  const userId = req.user._id;

  const startTime = Date.now();

  // Get task counts by status
  const statusStats = await Task.aggregate([
    { $match: { userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Get task counts by priority
  const priorityStats = await Task.aggregate([
    { $match: { userId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Get task counts by category
  const categoryStats = await Task.aggregate([
    { $match: { userId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  // Get overdue tasks count
  const overdueCount = await Task.countDocuments({
    userId,
    status: { $in: ['Pending', 'Overdue'] },
    dueDate: { $lt: new Date() }
  });

  // Get upcoming tasks (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingCount = await Task.countDocuments({
    userId,
    status: 'Pending',
    dueDate: { $gte: new Date(), $lte: nextWeek }
  });

  // Get completion rate for this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const thisMonthTasks = await Task.countDocuments({
    userId,
    createdAt: { $gte: thisMonth }
  });

  const thisMonthCompleted = await Task.countDocuments({
    userId,
    status: 'Completed',
    createdAt: { $gte: thisMonth }
  });

  const completionRate = thisMonthTasks > 0 ? (thisMonthCompleted / thisMonthTasks * 100).toFixed(1) : 0;

  const duration = Date.now() - startTime;
  dbLogger.logQuery('aggregate', 'tasks', { userId }, duration);

  res.status(200).json({
    success: true,
    message: 'Task statistics retrieved successfully',
    data: {
      totalTasks: await Task.countDocuments({ userId }),
      statusStats,
      priorityStats,
      categoryStats,
      overdueCount,
      upcomingCount,
      thisMonthStats: {
        total: thisMonthTasks,
        completed: thisMonthCompleted,
        completionRate: parseFloat(completionRate)
      }
    }
  });
});

// Get overdue tasks
const getOverdueTasks = catchAsync(async(req, res, _next) => {
  const userId = req.user._id;

  const tasks = await Task.findOverdueTasks(userId);

  res.status(200).json({
    success: true,
    message: 'Overdue tasks retrieved successfully',
    data: {
      tasks,
      count: tasks.length
    }
  });
});

// Get upcoming tasks
const getUpcomingTasks = catchAsync(async(req, res, _next) => {
  const userId = req.user._id;
  const { days = 7 } = req.query;

  const tasks = await Task.findUpcomingTasks(userId, parseInt(days));

  res.status(200).json({
    success: true,
    message: 'Upcoming tasks retrieved successfully',
    data: {
      tasks,
      count: tasks.length,
      days: parseInt(days)
    }
  });
});

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  getTaskStats,
  getOverdueTasks,
  getUpcomingTasks
};
